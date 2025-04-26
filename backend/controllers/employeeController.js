const { fn, col, literal } = require("sequelize");
const {
  Employee,
  Role,
  Department,
  Order,
  EmployeeOrder,
  notificationPreference,
  notificationType,
} = require("../models/assosciations");
const Signature = require("../models/signatures");
const fs = require("fs");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { encryptPassword } = require("../utils/helpers");
const { moveFilesToPermanentLocation } = require("../utils/Upload");
const restrict = require("../utils/restrictions");
// Import the helper function
// Import necessary Sequelize functions
exports.getAllEmployees = catchAsync(async (req, res, next) => {
  const data = await restrict(Employee, req.session.user.role, [
    "id",
    "name",
    "email",
  ]);
  const employees = data
    ? data
    : await Employee.findAll({
        include: [
          {
            model: Role,
            as: "employeeRole",
            attributes: ["name", "permissions"],
          },
        ],
      });

  res.status(200).json({
    status: "success",
    results: employees.length,
    data: { employees },
  });
});

exports.createEmployee = catchAsync(async (req, res, next) => {
  try {
    // Initialize attachments object with all possible document types
    let attachments = {
      nationalId: null,
      passport: null,
      residencyPermit: null,
      profilePic: null,
      backup: null,
    };

    // Handle document upload if a file was uploaded
    if (req.file) {
      const documentType = req.body.documentType;
      if (
        ![
          "nationalId",
          "passport",
          "residencyPermit",
          "profilePic",
          "backup",
        ].includes(documentType)
      ) {
        return next(new AppError("Invalid document type", 400));
      }

      // Update only the specific document while keeping others as null
      attachments[documentType] = {
        path: req.file.path,
        url: req.file.url,
      };
    }

    // Encrypt password
    req.body.password = await encryptPassword(req.body.password);

    // Add attachments to request body
    req.body.attachment = attachments;

    // Create the new employee
    let employee = await Employee.create(req.body);

    // Create default notification preferences
    const notificationTypes = await notificationType.findAll();
    await notificationPreference.bulkCreate(
      notificationTypes.map((type) => ({
        employee_id: employee.id,
        notification_type_id: type.id,
        is_enabled: true,
      }))
    );

    if (req.tempUploadPath && attachments) {
      const updatedAttachments = await moveFilesToPermanentLocation(
        req.tempUploadPath,
        employee.id,
        attachments
      );

      await employee.update({ attachment: updatedAttachments });
    }

    res.status(201).json({
      status: "success",
      data: { employee },
    });
  } catch (error) {
    if (req.tempUploadPath) {
      fs.rmSync(req.tempUploadPath, { recursive: true, force: true });
    }
    return res.status(500).json({
      status: "error",
      message: error.message || "An unexpected error occurred",
    });
  }
});

exports.getEmployee = catchAsync(async (req, res, next) => {
  const employee = await Employee.findByPk(req.params.id);

  if (!employee) {
    return next(new AppError("No Employee found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { employee },
  });
});

exports.getMyData = catchAsync(async (req, res, next) => {
  // console.log("req.session.user:", req.session.user);
  const employee = await Employee.findByPk(req.session.user.id, {
    include: [
      {
        model: Role,
        as: "employeeRole",
        attributes: ["name", "permissions"],
      },
      {
        model: Department,
        as: "department",
        attributes: ["name"],
      },
      {
        model: Signature,
        as: "signatures",
        required: false,
      },
    ],
  });

  if (!employee) {
    return next(new AppError("No Employee found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { employee },
  });
});

// exports.updateEmployee = catchAsync(async (req, res, next) => {
//   try {
//     if (req.body.password) {
//       return next(
//         new AppError("Password updates not allowed through this route.", 400)
//       );
//     }
//     let employee = await Employee.findByPk(req.params.id);
//     if (!employee) {
//       return next(new AppError("No Employee found with that ID", 404));
//     }
//     // Handle file upload
//     if (req.file || req.body.signature) {
//       const documentType = req.body.documentType;
//       // Validate document type
//       if (!["nationalId", "passport", "residencyPermit", "profilePic", "signature"].includes(documentType)) {
//         return next(new AppError("Invalid document type", 400));
//       }

//       // If it's not a signature, handle it as a regular file upload
//       if (documentType !== "signature" && req.file) {
//         const currentAttachments = employee.attachment || {
//           nationalId: null,
//           passport: null,
//           residencyPermit: null,
//           profilePic: null,
//           backup: null
//         };

//         req.body.attachment = {
//           ...currentAttachments,
//           [documentType]: {
//             path: req.file.path,
//             url: req.file.url,
//           },
//         };
//       }
//       // The signature is already in req.body.signature from the upload middleware
//     }
//     // Update employee with all changes
//     await employee.update(req.body);

//     res.status(200).json({
//       status: "success",
//       data: { employee },
//     });
//   } catch (error) {
//     console.error("Error in updateEmployee:", error);
//     next(error);
//   }
// });

exports.updateEmployee = catchAsync(async (req, res, next) => {
  try {
    if (req.body.password) {
      return next(
        new AppError("Password updates not allowed through this route.", 400)
      );
    }

    let employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return next(new AppError("No Employee found with that ID", 404));
    }

    // Handle file upload or signature
    if (req.file) {
      const documentType = req.body.documentType;

      // Validate document type
      if (
        ![
          "nationalId",
          "passport",
          "residencyPermit",
          "profilePic",
          "signature",
          "backup",
        ].includes(documentType)
      ) {
        return next(new AppError("Invalid document type", 400));
      }

      const currentAttachments = employee.attachment || {
        nationalId: null,
        passport: null,
        residencyPermit: null,
        profilePic: null,
        backup: null,
      };

      if (req.file) {
        // Handle regular file uploads
        req.body.attachment = {
          ...currentAttachments,
          [documentType]: {
            path: req.file.path,
            url: req.file.url,
          },
        };
      }
    }

    // Update employee with all changes
    await employee.update(req.body);

    res.status(200).json({
      status: "success",
      data: { employee },
    });
  } catch (error) {
    console.error("Error in updateEmployee:", error);
    next(error);
  }
});
exports.updateMyData = catchAsync(async (req, res, next) => {
  try {
    if (req.body.password) {
      return next(
        new AppError("Password updates not allowed through this route.", 400)
      );
    }

    const employee = await Employee.findByPk(req.session.user.id)
    if (!employee) {
      return next(new AppError("No Employee found with that ID", 404));
    }

    console.log("Received update request:", req.body)

    const updateData = {}

    // Handle file upload or signature
    if (req.file) {
      const documentType = req.body.documentType

      // Validate document type
      if (
        ![
          "nationalId",
          "passport",
          "residencyPermit",
          "profilePic",
          "signature",
          "backup",
        ].includes(documentType)
      ) {
        return next(new AppError("Invalid document type", 400));
      }

      const currentAttachments = employee.attachment || {
        nationalId: null,
        passport: null,
        residencyPermit: null,
        profilePic: null,
        backup: null,
      };

      updateData.attachment = {
        ...currentAttachments,
        [documentType]: {
          path: req.file.path,
          url: req.file.url,
        },
      }
    }
    if (req.body.attachment) {
      const currentAttachments = employee.attachment || {
        nationalId: null,
        passport: null,
        residencyPermit: null,
        profilePic: null,
        backup: null,
      };
    
      updateData.attachment = {
        ...currentAttachments,
        ...req.body.attachment, // Merge updates
      };
    }
    // Explicitly check for signature update
    if ("signature" in req.body) {
      console.log("Updating signature:", req.body.signature)
      updateData.signature = req.body.signature
    }

    console.log("Update data:", updateData)

    // Update employee with all changes
    const updatedEmployee = await employee.update(updateData)

    console.log("Updated employee:", updatedEmployee.toJSON())

    res.status(200).json({
      status: "success",
      data: { employee: updatedEmployee }
    });
  } catch (error) {
    console.error("Error in updateEmployee:", error);
    next(error);
  }
});

exports.updateEmployeeDocument = catchAsync(async (req, res, next) => {
  try {
    let employee = await Employee.findByPk(req.params.id);

    if (!employee) {
      return next(new AppError("No Employee found with that ID", 404));
    }

    if (!req.file) {
      return next(new AppError("No file uploaded", 400));
    }

    const documentType = req.body.documentType;
    if (
      !["nationalId", "passport", "residencyPermit", "profilePic"].includes(
        documentType
      )
    ) {
      return next(new AppError("Invalid document type", 400));
    }

    // Get current attachments or initialize with all document types
    const currentAttachments = employee.attachment || {
      nationalId: null,
      passport: null,
      residencyPermit: null,
      profilePic: null,
    };

    console.log("Current attachments before update:", currentAttachments);

    // Create new attachments object preserving existing documents
    const updatedAttachments = {
      ...currentAttachments, // Spread existing attachments first
      [documentType]: {
        // Then update only the specific document
        path: req.file.path,
        url: req.file.url,
      },
    };

    console.log("Updated attachments to be saved:", updatedAttachments);

    // Update the employee with new attachments
    await employee.update({ attachment: updatedAttachments });

    res.status(200).json({
      status: "success",
      data: { employee },
    });
  } catch (error) {
    console.error("Error in updateEmployeeDocument:", error);
    next(error);
  }
});

exports.deleteEmployee = catchAsync(async (req, res, next) => {
  const employee = await Employee.findByPk(req.params.id);

  if (!employee) {
    return next(new AppError("No Employee found with that ID", 404));
  }

  await employee.destroy();

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getEmployeesByDepartment = catchAsync(async (req, res, next) => {
  const { department } = req.body;

  const employees = await Employee.findAll({
    where: { department_id: department },
    include: [
      {
        model: Role,
        as: "employeeRole",
        attributes: ["name", "permissions"],
      },
      {
        model: Department,
        as: "department",
        attributes: ["name"],
      },
    ],
  });

  res.status(200).json({
    status: "success",
    results: employees.length,
    data: { employees },
  });
});

exports.updateEmployeeRole = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { roleId } = req.body;

  // Verify role exists
  const newRole = await Role.findByPk(roleId);
  if (!newRole) {
    return next(new AppError("Role not found", 404));
  }

  // Update Employee
  const employee = await Employee.findByPk(id);
  if (!employee) {
    return next(new AppError("Employee not found", 404));
  }

  await employee.update({
    role_id: roleId,
  });

  res.status(200).json({
    status: "success",
    data: { employee },
  });
});

exports.getMyOrders = catchAsync(async (req, res, next) => {
  const employeeID = req.session.user.id;

  const orders = await Order.findAll({
    include: [
      {
        model: Employee,
        as: "notifiedEmployees",
        where: { id: employeeID },
        attributes: [], // Don't include employee data in response
        through: { attributes: [] }, // Don't include junction table data
      },
    ],
    order: [["created_at", "DESC"]], // Optional: sort by creation date
  });

  if (!orders) {
    return res.status(200).json({
      status: "success",
      results: 0,
      data: { orders: [] },
    });
  }

  res.status(200).json({
    status: "success",
    results: orders.length,
    data: { orders },
  });
});

exports.getEmployeeOrders = catchAsync(async (req, res, next) => {
  const employeeID = req.params.id;

  const orders = await Employee.findOne({
    where: { id: employeeID },
    include: {
      model: Order,
      as: "Orders",
      attributes: { exclude: ["created_at", "updatedAt"] },
    },
    attributes: [],
  });

  res.status(200).json({
    status: "success",
    results: orders.Orders.length,
    data: { orders: orders.Orders },
  });
});
//get employess according to their order sales

exports.getEmployeesSorted = catchAsync(async (req, res, next) => {
  try {
    const employees = await Employee.findAll({
      attributes: [
        // Select necessary Employee fields
        "id",
        "name",
        "email",

        // Aggregated Fields
        [
          fn("COALESCE", fn("SUM", col("Orders.price")), 0),
          "total_order_price",
        ],
        [fn("COALESCE", fn("COUNT", col("Orders.id")), 0), "order_count"],

        // Calculating Average Order Price using COALESCE and AVG
        [
          fn("COALESCE", fn("AVG", col("Orders.price")), 0),
          "average_order_price",
        ],
      ],
      include: [
        {
          model: Order,
          as: "Orders",
          attributes: [],
          required: false,
          through: {
            attributes: [], // Exclude join table attributes, including 'status'
          },
          // Ensure no 'where' clause referencing 'status'
          // where: { status: 'active' }, // Remove or comment out if 'status' doesn't exist
        },
      ],
      group: ["employee.id", "employee.name", "employee.email"], // Corrected casing
      order: [[fn("COALESCE", fn("AVG", col("Orders.price")), 0), "DESC"]],
      // Optional: Implement Pagination
      // limit: 50,
      // offset: 0,
      // Optional: Enable logging for debugging
      // logging: console.log,
    });

    res.status(200).json({
      status: "success",
      results: employees.length,
      data: { employees },
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    next(error); // Forward the error to the global error handler
  }
});

// Delete employee documents
exports.deleteEmployeeDocument = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const documentType = req.body.documentType;

  const employee = await Employee.findByPk(id);
  if (!employee) {
    return next(new AppError("Employee not found", 404));
  }

  const currentAttachments = employee.attachment || {
    nationalId: null,
    passport: null,
    residencyPermit: null,
    profilePic: null,
    backup: null,
  };

  // Check if the document exists
  if (!currentAttachments[documentType]) {
    return next(new AppError("Document not found", 404));
  }

  // Create a new attachments object with the specific document nullified
  const updatedAttachments = {
    ...currentAttachments,
    [documentType]: null,
  };

  // Update the employee with the entire attachments object
  await employee.update({
    attachment: updatedAttachments,
  });

  res.status(200).json({
    status: "success",
    data: employee.attachment,
  });
});
