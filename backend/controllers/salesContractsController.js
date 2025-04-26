const {
  SalesContract,
  SalesContractLog,
  VendorRevenue,
  CompanyRevenue,
  Employee,
  Role,
  Signature,
} = require("../models/assosciations");
const AppError = require("../utils/AppError");
const db = require("../config/db");
const catchAsync = require("../utils/catchAsync");
const { updateSalesRevenue } = require("../utils/analytics");
const {
  baseUploadDir,
  createUploadDir,
} = require("../utils/Upload");
const path = require("path");
const fs = require("fs");
// Helper function
const getSubmitterAndRole = async (sessionUserId) => {
  const employee = await Employee.findByPk(sessionUserId, {
    include: [{ model: Role, as: "employeeRole" }],
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  return {
    submitter_id: employee.id,
    role: employee.employeeRole.name,
  };
};

const createSalesContract = catchAsync(async (req, res, next) => {
  const transaction = await db.transaction();

  try {
    // Check if the user is logged in (session validation)
    if (!req.session.user) {
      await transaction.rollback();
      return next(new AppError("Unauthorized", 401));
    }

    // Get the submitter's ID and role from the session
    const { submitter_id, role } = await getSubmitterAndRole(
      req.session.user.id
    );

    // Extract the required fields from the request body
    const { termination_date, ...restOfRequestBody } = req.body;

    // Ensure termination_date is provided
    if (!termination_date) {
      await transaction.rollback();
      return next(new AppError("Termination date is required", 400));
    }

    const currentDate = new Date();
    const parsedTerminationDate = new Date(termination_date);

    // Calculate the status based on the termination date
    let status = "pending"; // Default status if no condition matches

    if (currentDate < parsedTerminationDate) {
      // Active: current date is less than termination date
      status = "active";

      const oneMonthBeforeExpiry = new Date(parsedTerminationDate);
      oneMonthBeforeExpiry.setMonth(oneMonthBeforeExpiry.getMonth() - 1);

      // Expiring Soon: current date is less than 1 month before termination date
      if (currentDate >= oneMonthBeforeExpiry) {
        status = "expiring soon";
      }
    } else {
      // Expired: current date is greater than termination date
      status = "expired";
    }

    // Create the sales contract with the calculated status (attachment is null initially)
    const salesContract = await SalesContract.create(
      {
        ...restOfRequestBody,
        termination_date: parsedTerminationDate,
        status, // Set the calculated status
        attachment: null, // Temporarily null, will update after saving file
      },
      { transaction }
    );

    // Store salesId in request for URL generation
    req.salesId = salesContract.id;

    // Handle file upload if a file is present
    if (req.file) {
      const uploadType = "salesContracts";
      const filename = `${uploadType}-${generateUniqueId()}${path
        .extname(req.file.originalname)
        .toLowerCase()}`;
      const salesId = salesContract.id.toString();
      const uploadPath = path.join(baseUploadDir, uploadType, salesId);

      // Create the directory if it doesn't exist
      createUploadDir(uploadPath);

      // Define the full path to save the file
      const filePath = path.join(uploadPath, filename);

      // Save the file buffer to the desired location
      fs.writeFileSync(filePath, req.file.buffer);

      // Generate the URL for the saved file
      const fileUrl = `/uploads/${uploadType}/${salesId}/${filename}`;

      // Update the salesContract with the attachment info
      await salesContract.update(
        {
          attachment: {
            path: `uploads/${uploadType}/${salesId}/${filename}`,
            url: fileUrl,
          },
        },
        { transaction }
      );
    }

    // Handle revenue updates
    if (salesContract.vendor_id) {
      await updateSalesRevenue({
        model: VendorRevenue,
        idField: "vendor_id",
        idValue: salesContract.vendor_id,
        modifiedContractValue: salesContract.unit_price,
        oldModifiedContractValue: 0,
        totalPaid: salesContract.total_paid,
        totalRemaining: salesContract.due_payment,
        salesContract: 1,
        transaction,
      });
    }
    if (salesContract.company_id) {
      await updateSalesRevenue({
        model: CompanyRevenue,
        idField: "company_id",
        idValue: salesContract.company_id,
        modifiedContractValue: salesContract.unit_price,
        oldModifiedContractValue: 0,
        totalPaid: salesContract.total_paid,
        totalRemaining: salesContract.due_payment,
        salesContract: 1,
        transaction,
      });
    }

    // Log the sales contract creation in the SalesContractLog table
    await SalesContractLog.create(
      {
        sales_contract_id: salesContract.id,
        operation_type: "CREATE",
        performed_by: submitter_id,
        old_data: null,
        new_data: salesContract.toJSON(),
        timestamp: new Date(),
      },
      { transaction }
    );

    // Commit the transaction
    await transaction.commit();

    // Respond with the created sales contract and status
    res.status(201).json({
      status: "success",
      data: { salesContract },
    });
  } catch (error) {
    // Rollback the transaction in case of any error
    await transaction.rollback();

    // If a file was uploaded and saved, delete it to prevent orphaned files
    if (req.file && req.salesId) {
      const uploadType = "salesContracts";
      const salesId = req.salesId.toString();
      const uploadPath = path.join(baseUploadDir, uploadType, salesId);
      const filename = `${uploadType}-${generateUniqueId()}${path
        .extname(req.file.originalname)
        .toLowerCase()}`;
      const filePath = path.join(uploadPath, filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }
});

const getAllSalesContracts = catchAsync(async (req, res, next) => {
  const salesContracts = await SalesContract.findAll({
    include: [
      {
        model: Signature,
        as: "signatures",
        required: false,
      },
    ]
  });

  const currentDate = new Date();

  const contractsWithStatus = salesContracts.map((contract) => {
    const terminationDate = new Date(contract.termination_date);

    let status;
    if (currentDate < terminationDate) {
      const oneMonthBeforeTermination = new Date(terminationDate);
      oneMonthBeforeTermination.setMonth(
        oneMonthBeforeTermination.getMonth() - 1
      );

      if (currentDate >= oneMonthBeforeTermination) {
        status = "expiring soon";
      } else {
        status = "active";
      }
    } else {
      status = "expired";
    }

    return {
      ...contract.toJSON(),
      status: status,
    };
  });

  res.status(200).json({
    status: "success",
    data: { salesContracts: contractsWithStatus },
  });
});

const getSalesContract = catchAsync(async (req, res, next) => {
  const salesContract = await SalesContract.findByPk(req.params.id,{
    include: [
      {
        model: Signature,
        as : "signatures",
        required: false,
      }]
  });
  if (!salesContract) {
    return next(new AppError("Sales contract not found", 404));
  }

  const currentDate = new Date();
  const terminationDate = new Date(salesContract.termination_date);

  let status;
  if (currentDate < terminationDate) {
    const oneMonthBeforeTermination = new Date(terminationDate);
    oneMonthBeforeTermination.setMonth(
      oneMonthBeforeTermination.getMonth() - 1
    );

    if (currentDate >= oneMonthBeforeTermination) {
      status = "expiring soon";
    } else {
      status = "active";
    }
  } else {
    status = "expired";
  }
  salesContract.status = status;
  res.status(200).json({
    status: "success",
    data: { salesContract },
  });
});

const updateSalesContract = catchAsync(async (req, res, next) => {
  const transaction = await db.transaction();

  try {
    // Fetch the existing sales contract
    const salesContract = await SalesContract.findByPk(req.params.id);
    if (!salesContract) {
      await transaction.rollback();
      return next(new AppError("Sales contract not found", 404));
    }

    // Store the old state for logging
    const oldData = salesContract.toJSON();

    // Extract termination_date if provided
    const { termination_date } = req.body;
    let updatedStatus = salesContract.status;

    if (termination_date) {
      const currentDate = new Date();
      const parsedTerminationDate = new Date(termination_date);

      // Calculate the status based on the termination date
      if (currentDate < parsedTerminationDate) {
        const oneMonthBeforeExpiry = new Date(parsedTerminationDate);
        oneMonthBeforeExpiry.setMonth(oneMonthBeforeExpiry.getMonth() - 1);

        if (currentDate >= oneMonthBeforeExpiry) {
          updatedStatus = "expiring soon";
        } else {
          updatedStatus = "active";
        }
      } else {
        updatedStatus = "expired";
      }

      // Update status in the request body
      req.body.status = updatedStatus;
    }

    // Update the sales contract fields
    await salesContract.update(req.body, { transaction });

    // Handle file upload if a file is present
    if (req.file) {
      const uploadType = "salesContracts";
      const salesId = salesContract.id.toString();
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      const filename = `${uploadType}-${generateUniqueId()}${fileExtension}`;
      const uploadPath = path.join(baseUploadDir, uploadType, salesId);

      // Create the directory if it doesn't exist
      createUploadDir(uploadPath);

      // Define the full path to save the file
      const filePath = path.join(uploadPath, filename);

      // Save the file buffer to the desired location asynchronously
      await fs.promises.writeFile(filePath, req.file.buffer);

      // Generate the URL for the saved file
      const fileUrl = `/uploads/${uploadType}/${salesId}/${filename}`;

      // Optionally, delete the previous attachment if it exists
      if (salesContract.attachment && salesContract.attachment.path) {
        const oldFilePath = path.join(
          __dirname,
          "..",
          "public",
          salesContract.attachment.path
        );
        if (fs.existsSync(oldFilePath)) {
          await fs.promises.unlink(oldFilePath);
        }
      }

      // Update the salesContract with the new attachment info
      await salesContract.update(
        {
          attachment: {
            path: `uploads/${uploadType}/${salesId}/${filename}`,
            url: fileUrl,
          },
        },
        { transaction }
      );
    }

    // Update revenue if necessary
    if (req.body.due_payment || req.body.total_paid || req.body.unit_price) {
      if (salesContract.vendor_id) {
        await updateSalesRevenue({
          model: VendorRevenue,
          idField: "vendor_id",
          idValue: salesContract.vendor_id,
          modifiedContractValue:
            req.body.unit_price || salesContract.unit_price,
          oldModifiedContractValue: req.body.unit_price
            ? oldData.unit_price
            : 0,
          totalPaid: req.body.total_paid || salesContract.total_paid,
          totalRemaining: req.body.due_payment || salesContract.due_payment,
          OldTotalPaid: req.body.total_paid ? oldData.total_paid : 0,
          OldTotalRemaining: req.body.due_payment ? oldData.due_payment : 0,
          transaction,
        });
      }
      if (salesContract.company_id) {
        await updateSalesRevenue({
          model: CompanyRevenue,
          idField: "company_id",
          idValue: salesContract.company_id,
          modifiedContractValue:
            req.body.unit_price || salesContract.unit_price,
          oldModifiedContractValue: req.body.unit_price
            ? oldData.unit_price
            : 0,
          totalPaid: req.body.total_paid || salesContract.total_paid,
          totalRemaining: req.body.due_payment || salesContract.due_payment,
          OldTotalPaid: req.body.total_paid ? oldData.total_paid : 0,
          OldTotalRemaining: req.body.due_payment ? oldData.due_payment : 0,
          transaction,
        });
      }
    }

    // Get the submitter info for logging
    const { submitter_id, role } = await getSubmitterAndRole(
      req.session.user.id
    );

    // Create a log entry for the update
    await SalesContractLog.create(
      {
        sales_contract_id: salesContract.id,
        operation_type: "UPDATE",
        performed_by: submitter_id,
        old_data: oldData,
        new_data: salesContract.toJSON(),
        timestamp: new Date(),
      },
      { transaction }
    );

    // Commit the transaction
    await transaction.commit();

    // Respond with the updated sales contract and status
    res.status(200).json({
      status: "success",
      data: { salesContract },
    });
  } catch (error) {
    // Rollback the transaction in case of any error
    await transaction.rollback();

    // If a file was uploaded and partially saved, attempt to delete it to prevent orphaned files
    if (req.file && salesContract) {
      try {
        const uploadType = "salesContracts";
        const salesId = salesContract.id.toString();
        const fileExtension = path.extname(req.file.originalname).toLowerCase();
        const filename = `${uploadType}-${generateUniqueId()}${fileExtension}`;
        const uploadPath = path.join(baseUploadDir, uploadType, salesId);
        const filePath = path.join(uploadPath, filename);

        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      } catch (fileError) {
        // Log the file deletion error, but do not override the original error
        console.error(
          "Error deleting uploaded file after transaction failure:",
          fileError
        );
      }
    }

    // Pass the error to the global error handler
    next(error);
  }
});

const deleteSalesContract = catchAsync(async (req, res, next) => {
  const transaction = await db.transaction();

  const salesContract = await SalesContract.findByPk(req.params.id);
  if (!salesContract) {
    await transaction.rollback();
    return next(new AppError("Sales contract not found", 404));
  }

  const { submitter_id, role } = await getSubmitterAndRole(req.session.user.id);

  // Create deletion log
  await SalesContractLog.create(
    {
      sales_contract_id: salesContract.id,
      operation_type: "DELETE",
      performed_by: submitter_id,
      old_data: salesContract.toJSON(),
      new_data: null,
      timestamp: new Date(),
    },
    { transaction }
  );

  // Set sales_contract_id to null for all related logs
  await SalesContractLog.update(
    { sales_contract_id: null },
    {
      where: { sales_contract_id: salesContract.id },
      transaction,
    }
  );

  if (salesContract.vendor_id) {
    await updateSalesRevenue({
      model: VendorRevenue,
      idField: "vendor_id",
      idValue: salesContract.vendor_id,
      modifiedContractValue: 0,
      oldModifiedContractValue: salesContract.unit_price,
      OldTotalPaid: salesContract.total_paid,
      OldTotalRemaining: salesContract.due_payment,
      salesContract: -1,
      transaction,
    });
  }
  if (salesContract.company_id) {
    await updateSalesRevenue({
      model: CompanyRevenue,
      idField: "company_id",
      idValue: salesContract.company_id,
      modifiedContractValue: 0,
      oldModifiedContractValue: salesContract.unit_price,
      OldTotalPaid: salesContract.total_paid,
      OldTotalRemaining: salesContract.due_payment,
      salesContract: -1,
      transaction,
    });
  }

  // Now safe to delete the contract
  await salesContract.destroy({ transaction });
  await transaction.commit();

  res.status(204).json({
    status: "success",
    data: null,
  });
});

const generateUniqueId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${timestamp}-${random}`;
};

module.exports = {
  createSalesContract,
  getAllSalesContracts,
  getSalesContract,
  updateSalesContract,
  deleteSalesContract,
};
