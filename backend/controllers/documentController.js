const {
  Document,
  Department,
  Order,
  DepartmentDocument,
  Vendor,
  Company,
  VendorRevenue,
  CompanyRevenue,
  Signature,
} = require("../models/assosciations");
const AppError = require("../utils/AppError");
const { Sequelize } = require("sequelize");
const db = require("../config/db");
const DocumentLog = require("../models/documentLogModel");
const Employee = require("../models/employeeModel");
const Role = require("../models/roleModel");
const { Op } = require("sequelize");
const { updateRevenue } = require("../utils/analytics");
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

// Create document
const createDocument = async (req, res, next) => {
  const transaction = await db.transaction();
  try {
    if (!req.session.user) {
      throw new AppError("Unauthorized", 401);
    }

    const sessionUserId = req.session.user.id;
    const department_id = req.params.id;
    const { submitter_id, role } = await getSubmitterAndRole(sessionUserId);

    const {
      title,
      client,
      vendor,
      company,
      contract_value,
      change_order = 0,
      currency,
      status = "draft",
      vendor_id,
      company_id,
      details = {},
      type,
      amount_paid,
      amount_due,
      expiry_date, // Expect expiry_date from the request body
    } = req.body;

    if (!title || !client || !contract_value || !currency || !expiry_date) {
      throw new AppError("Missing required fields", 400);
    }

    // Calculate status based on expiry_date
    const currentDate = new Date();
    const parsedExpiryDate = new Date(expiry_date);

    let documentStatus;
    if (currentDate < parsedExpiryDate) {
      const oneMonthBeforeExpiry = new Date(parsedExpiryDate);
      oneMonthBeforeExpiry.setMonth(oneMonthBeforeExpiry.getMonth() - 1);

      if (currentDate >= oneMonthBeforeExpiry) {
        documentStatus = "expiring soon";
      } else {
        documentStatus = "active";
      }
    } else {
      documentStatus = "expired";
    }

    const document = await Document.create(
      {
        title,
        client,
        vendor_id,
        company_id,
        contract_value,
        change_order,
        currency,
        amount_paid,
        amount_due,
        status: documentStatus, // Set the calculated status
        type: type.toLowerCase(),
        details: JSON.stringify(details),
        expiry_date: parsedExpiryDate, // Save expiry_date in the database
        attachment: req.file
          ? { path: req.file.path, url: req.file.url }
          : null
      },
      { transaction }
    );

    const { modified_contract_value } = document;

    if (vendor_id) {
      await updateRevenue({
        model: VendorRevenue,
        idField: "vendor_id",
        idValue: vendor_id,
        modifiedContractValue: modified_contract_value,
        oldModifiedContractValue: 0,
        contract: 1,
        transaction,
      });
    }

    if (company_id) {
      await updateRevenue({
        model: CompanyRevenue,
        idField: "company_id",
        idValue: company_id,
        modifiedContractValue: modified_contract_value,
        oldModifiedContractValue: 0,
        contract: 1,
        transaction,
      });
    }

    if (department_id) {
      await DepartmentDocument.create(
        {
          document_id: document.id,
          department_id,
        },
        { transaction }
      );
    }

    await DocumentLog.create(
      {
        document_id: document.id,
        operation_type: "CREATE",
        document_type: "REGULAR",
        submitter_id: submitter_id,
        role: role,
        action: "created",
        user_id: submitter_id,
        details: `Document created by ${role}`,
        old_data: null,
        new_data: JSON.stringify(document),
        created_at: new Date(),
      },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json({
      status: "success",
      data: {
        document,
      },
    });
  } catch (error) {
    await transaction.rollback();
    next(new AppError(error, 400));
  }
};

// Get all documents
const getAllDocuments = async (req, res) => {
  try {
    const { type } = req.query; // Get the type from query parameters
    const whereClause = type ? { type: type.replace(/-/g, " ") } : {}; // Replace dashes with spaces if type is provided

    const documents = await Document.findAll({
      where: whereClause,
      include: [
        {
          model: Signature,
          as: "signatures",
          required: false,
        },
        {
          model: Vendor,
          as: "vendorDetails",
          attributes: ["id", "name"],
        },
        {
          model: Company,
          as: "companyDetails",
          attributes: ["id", "name"],
        },
      ],
    });

    const currentDate = new Date();

    const documentsWithStatus = documents.map((document) => {
      const expiryDate = new Date(document.expiry_date);

      let status;
      if (currentDate < expiryDate) {
        const oneMonthBeforeExpiry = new Date(expiryDate);
        oneMonthBeforeExpiry.setMonth(oneMonthBeforeExpiry.getMonth() - 1);

        if (currentDate >= oneMonthBeforeExpiry) {
          status = "expiring soon";
        } else {
          status = "active";
        }
      } else {
        status = "expired";
      }

      return {
        ...document.toJSON(),
        status, // Add the status field to each document
      };
    });

    res.status(200).json({
      status: "success",
      results: documentsWithStatus.length,
      data: {
        documents: documentsWithStatus,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while fetching documents",
    });
  }
};

// Get document by ID
const getDocumentById = async (req, res) => {
  try {
    let document = await Document.findOne({
      where: { id: req.params.id },
      attributes: {
        include: ["modified_contract_value"],
      },
      include: [
        {
          model: Signature,
          as: "signatures",
          required: false,
        },
        {
          model: Company,
          as: "companyDetails",
          required: false,
        },
        {
          model: Vendor,
          as: "vendorDetails",
          required: false,
        },
        {
          model: Department,
          through: DepartmentDocument,
          as: "departments",
        },
        {
          model: DocumentLog,
          as: "logs",
          include: [
            {
              model: Employee,
              as: "submitter", // Added alias for Employee
              attributes: ["name", "email"],
            },
          ],
        },
      ],
    });

    if (!document) {
      return res.status(404).json({
        status: "error",
        message: "Document not found",
      });
    }

    // Parse document details if they exist
    try {
      if (document.details) {
        document.details = JSON.parse(document.details);
      }
    } catch (error) {
      console.error("Error parsing document details:", error);
      document.details = {};
    }

    // Calculate status based on expiry_date
    const currentDate = new Date();
    const expiryDate = new Date(document.expiry_date);

    let status;
    if (currentDate < expiryDate) {
      const oneMonthBeforeExpiry = new Date(expiryDate);
      oneMonthBeforeExpiry.setMonth(oneMonthBeforeExpiry.getMonth() - 1);

      if (currentDate >= oneMonthBeforeExpiry) {
        status = "expiring soon";
      } else {
        status = "active";
      }
    } else {
      status = "expired";
    }

    // Add the calculated status to the document object
    document = {
      ...document.toJSON(),
      status, // Add the status field to the response
    };

    res.status(200).json({
      status: "success",
      data: {
        document,
      },
    });
  } catch (error) {
    console.error("Error in getDocumentById:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Update document
const updateDocument = async (req, res, next) => {
  const transaction = await db.transaction();
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      await transaction.rollback();
      return next(new AppError("Document not found", 404));
    }

    // Store complete old state
    const oldValues = document.toJSON();

    // Extract expiry_date if provided in the request body
    const { expiry_date } = req.body;
    let updatedStatus = document.status;

    if (expiry_date) {
      const currentDate = new Date();
      const parsedExpiryDate = new Date(expiry_date);

      if (currentDate < parsedExpiryDate) {
        const oneMonthBeforeExpiry = new Date(parsedExpiryDate);
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

    // Update document
    await document.update(req.body, { transaction });

    // Store complete new state
    const newValues = document.toJSON();

    const oldPrice = parseFloat(oldValues.modified_contract_value);
    const newPrice = parseFloat(newValues.modified_contract_value);

    if (oldPrice !== newPrice) {
      if (document.vendor_id) {
        await updateRevenue({
          model: VendorRevenue,
          idField: "vendor_id",
          idValue: document.vendor_id,
          modifiedContractValue: newPrice,
          oldModifiedContractValue: oldPrice,
          contract: 0,
          transaction,
        });
      }

      if (document.company_id) {
        await updateRevenue({
          model: CompanyRevenue,
          idField: "company_id",
          idValue: document.company_id,
          modifiedContractValue: newPrice,
          oldModifiedContractValue: oldPrice,
          contract: 0,
          transaction,
        });
      }
    }

    // Log the changes
    if (req.session.user) {
      const { submitter_id, role } = await getSubmitterAndRole(
        req.session.user.id
      );
      await DocumentLog.create(
        {
          document_id: document.id,
          operation_type: "UPDATE",
          document_type: "REGULAR",
          submitter_id: submitter_id,
          role: role,
          action: "updated",
          user_id: submitter_id,
          details: `Document updated by ${role}`,
          old_data: oldValues,
          new_data: newValues,
          created_at: new Date(),
        },
        { transaction }
      );
    }

    await transaction.commit();

    res.status(200).json({
      status: "success",
      data: {
        document: document,
      },
    });
  } catch (error) {
    await transaction.rollback();
    next(new AppError(error.message, 400));
  }
};

// Delete document
const deleteDocument = async (req, res, next) => {
  const transaction = await db.transaction();
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      await transaction.rollback();
      return next(new AppError("Document not found", 404));
    }

    // Log deletion
    if (req.session.user) {
      const { submitter_id, role } = await getSubmitterAndRole(
        req.session.user.id
      );
      await DocumentLog.create(
        {
          document_id: document.id,
          operation_type: "DELETE",
          document_type: "REGULAR",
          submitter_id: submitter_id,
          role: role,
          action: "deleted",
          user_id: submitter_id,
          details: `Document deleted by ${role}`,
          old_data: document.toJSON(),
          new_data: null,
          created_at: new Date(),
        },
        { transaction }
      );
    }
    if (document.vendor_id) {
      await updateRevenue({
        model: VendorRevenue,
        idField: "vendor_id",
        idValue: document.vendor_id,
        modifiedContractValue: 0,
        oldModifiedContractValue: document.modified_contract_value,
        contract: -1,
        transaction,
      });
    }

    if (document.company_id) {
      await updateRevenue({
        model: CompanyRevenue,
        idField: "company_id",
        idValue: document.company_id,
        modifiedContractValue: 0,
        oldModifiedContractValue: document.modified_contract_value,
        contract: -1,
        transaction,
      });
    }

    await document.destroy({ transaction });
    await transaction.commit();

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    await transaction.rollback();
    next(new AppError(error.message, 400));
  }
};

// Get document totals
const getTotals = async (req, res) => {
  try {
    const totals = await Document.findAll({
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.col("id")), "total_documents"],
        [
          Sequelize.fn("SUM", Sequelize.col("contract_value")),
          "total_contract_value",
        ],
        [
          Sequelize.fn("SUM", Sequelize.col("change_order")),
          "total_change_orders",
        ],
        [
          Sequelize.literal("SUM(contract_value + change_order)"),
          "total_modified_value",
        ],
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal("CASE WHEN status = 'approved' THEN 1 END")
          ),
          "approved_documents",
        ],
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal("CASE WHEN status = 'pending' THEN 1 END")
          ),
          "pending_documents",
        ],
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal("CASE WHEN status = 'rejected' THEN 1 END")
          ),
          "rejected_documents",
        ],
      ],
    });

    const vendorTotals = await Document.findAll({
      attributes: [
        "vendor",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "document_count"],
        [Sequelize.fn("SUM", Sequelize.col("contract_value")), "total_value"],
        [
          Sequelize.literal("SUM(contract_value + change_order)"),
          "modified_value",
        ],
      ],
      where: {
        vendor: {
          [Op.ne]: null,
        },
      },
      group: ["vendor"],
    });

    const companyTotals = await Document.findAll({
      attributes: [
        "company",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "document_count"],
        [Sequelize.fn("SUM", Sequelize.col("contract_value")), "total_value"],
        [
          Sequelize.literal("SUM(contract_value + change_order)"),
          "modified_value",
        ],
      ],
      group: ["company"],
    });

    res.status(200).json({
      status: "success",
      data: {
        totals: totals[0],
        vendorTotals,
        companyTotals,
      },
    });
  } catch (error) {
    console.error("Error fetching totals:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Calculate revenue
const calculateRevenue = async (documentId, transaction) => {
  const document = await Document.findByPk(documentId);
  if (!document) return;

  if (document.vendor) {
    await updateVendorRevenue(
      document.vendor,
      document.contract_value,
      transaction
    );
  }
  if (document.company) {
    await updateCompanyRevenue(
      document.company,
      document.contract_value,
      transaction
    );
  }
};

// Update vendor revenue
const updateVendorRevenue = async (vendorId, amount, transaction) => {
  await VendorRevenue.increment(
    { total_revenue_generated: amount },
    { where: { vendor_id: vendorId }, transaction }
  );
};

// Update company revenue
const updateCompanyRevenue = async (companyId, amount, transaction) => {
  await CompanyRevenue.increment(
    { total_revenue: amount },
    { where: { company_id: companyId }, transaction }
  );
};

// Update document status
const updateDocumentStatus = async (req, res, next) => {
  const transaction = await db.transaction();
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      await transaction.rollback();
      return next(new AppError("Document not found", 404));
    }

    const { status } = req.body;
    const oldStatus = document.status;

    await document.update({ status }, { transaction });

    if (req.session.user) {
      const { submitter_id, role } = await getSubmitterAndRole(
        req.session.user.id
      );
      await DocumentLog.create(
        {
          document_id: document.id,
          action: "status_updated",
          user_id: submitter_id,
          details: `Status updated from ${oldStatus} to ${status} by ${role}`,
          old_data: JSON.stringify({ status: oldStatus }),
          new_data: JSON.stringify({ status }),
          created_at: new Date(),
        },
        { transaction }
      );
    }

    await transaction.commit();

    res.status(200).json({
      status: "success",
      data: {
        document,
      },
    });
  } catch (error) {
    await transaction.rollback();
    next(new AppError(error.message, 400));
  }
};

// Update module.exports
module.exports = {
  createDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getTotals,
  calculateRevenue,
  updateDocumentStatus,
  updateVendorRevenue,
  updateCompanyRevenue,
};
