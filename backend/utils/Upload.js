const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sanitizeFilename = require("sanitize-filename");
const AppError = require("../utils/AppError");
const { Employee } = require("../models/assosciations");
const { v4: uuidv4 } = require("uuid");
const convertToBase64 = require("../utils/base64");
// Base upload directory
const baseUploadDir = path.join(__dirname, "..", "public", "uploads");

// Allowed file types configuration
const allowedTypes = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
};

// Generate unique ID for files
const generateUniqueId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${timestamp}-${random}`;
};

// File filter function
const fileFilter = (req, file, cb) => {
  file.originalname = sanitizeFilename(file.originalname);
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const fileMimeType = file.mimetype;
  //custom for profule pic
  if (req.body.documentType === "profilePic") {
    if (!["image/jpeg", "image/png"].includes(fileMimeType)) {
      return cb(
        new AppError("Profile pictures must be JPEG or PNG files.", 400),
        false
      );
    }
    return cb(null, true);
  }

  const isAllowedType = Object.keys(allowedTypes).includes(fileMimeType);
  const isAllowedExtension =
    allowedTypes[fileMimeType]?.includes(fileExtension);

  if (!isAllowedType || !isAllowedExtension) {
    return cb(new AppError("Invalid file type or extension.", 400), false);
  }

  cb(null, true);
};

// Create upload directory if it doesn't exist
const createUploadDir = (uploadPath) => {
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  return uploadPath;
};

// Path generators for different upload types
const pathGenerators = {
  // Default path generator (used for orders and other types)
  default: (uploadType, req) => {
    const employeeId = req.body.employee_id || req.session.user.id;
    if (!employeeId) {
      throw new AppError("Employee ID is required for file upload.", 400);
    }
    return path.join(baseUploadDir, uploadType, employeeId.toString());
  },

  // Custom path generator for documents
  documents: (uploadType, req) => {
    const employeeId = req.body.employee_id || req.session.user.id;
    const department = req.params.id;
    console.log(department);
    if (!employeeId) {
      throw new AppError("Employee ID is required for file upload.", 400);
    }
    if (!department) {
      throw new AppError("Department is required for document upload.", 400);
    }

    return path.join(baseUploadDir, uploadType, department.toString());
  },
  employeeDocuments: (uploadType, req) => {
    // For new employee creation, we'll use a temporary directory
    let uploadPath;

    if (req.params.id) {
      // If updating existing employee
      uploadPath = path.join(
        baseUploadDir,
        "employees",
        req.params.id.toString(),
        "documents"
      );
    } else {
      // For new employee creation, use a temporary directory with timestamp
      const tempId = generateUniqueId();
      uploadPath = path.join(
        baseUploadDir,
        "employees",
        "temp",
        tempId.toString()
      );
      // Store the temp path in request for later use
      req.tempUploadPath = uploadPath;
    }

    return uploadPath;
  },

  tickets: (uploadType, req) => {
    const employeeId = req.body.employee_id || req.session.user.id;
    const ticketId = req.params.ticket_id || req.body.ticket_id;
    if (!employeeId) {
      throw new AppError("Employee ID is required for file upload.", 400);
    }
    if (!ticketId) {
      throw new AppError("Ticket ID is required for ticket file upload.", 400);
    }

    return path.join(
      baseUploadDir,
      uploadType,
      employeeId.toString(),
      ticketId.toString()
    );
  },
  vendors: (uploadType, req) => {
    const vendorId = req.params.id; // Assuming vendor ID is in URL params
    if (!vendorId) {
      throw new AppError("Vendor ID is required for file upload.", 400);
    }
    return path.join(baseUploadDir, uploadType, vendorId.toString());
  },

  // New path generator for companies
  companies: (uploadType, req) => {
    const companyId = req.params.id; // Assuming company ID is in URL params
    if (!companyId) {
      throw new AppError("Company ID is required for file upload.", 400);
    }
    return path.join(baseUploadDir, uploadType, companyId.toString());
  },
  profilePicture: (uploadType, req) => {
    let entityType, entityId;

    // Determine entity type and ID based on route
    if (req.baseUrl.includes("employees")) {
      entityType = "employees";
      entityId = req.params.id || "temp";
    } else if (req.baseUrl.includes("companies")) {
      entityType = "companies";
      entityId = req.params.id;
    } else if (req.baseUrl.includes("vendors")) {
      entityType = "vendors";
      entityId = req.params.id;
    }

    if (!entityId) {
      throw new AppError(
        `${entityType} ID is required for profile picture upload.`,
        400
      );
    }

    return path.join(baseUploadDir, entityType, entityId.toString(), "profile");
  },
  salesContracts: (uploadType, req) => {
    // Placeholder, actual path will be handled in controller
    return path.join(baseUploadDir, uploadType);
  },
};

// URL generators for different upload types
const urlGenerators = {
  // Default URL generator (used for orders and other types)
  default: (uploadType, req, filename) => {
    const employeeId = req.body.employee_id || req.session.user.id;
    return `/uploads/${uploadType}/${employeeId}/${filename}`;
  },
  // Custom URL generator for documents
  documents: (uploadType, req, filename) => {
    const department = req.params.id;
    return `/uploads/${uploadType}/${department}/${filename}`;
  },
  tickets: (uploadType, req, filename) => {
    const employeeId = req.body.employee_id || req.session.user.id;
    const ticketId = req.params.ticket_id || req.body.ticket_id;
    return `/uploads/${uploadType}/${employeeId}/${ticketId}/${filename}`;
  },
  employeeDocuments: (uploadType, req, filename) => {
    if (req.params.id) {
      return `/uploads/employees/${req.params.id}/documents/${filename}`;
    } else {
      const tempId = req.tempUploadPath.split(path.sep).pop();
      return `/uploads/employees/temp/${tempId}/${filename}`;
    }
  },
  vendors: (uploadType, req, filename) => {
    const vendorId = req.params.id;
    return `/uploads/${uploadType}/${vendorId}/${filename}`;
  },
  // New URL generator for companies
  companies: (uploadType, req, filename) => {
    return `/uploads/${uploadType}/${filename}`;
  },

  salesContracts: (uploadType, req, filename) => {
    const salesId = req.salesId; // salesId should be set in the controller
    if (!salesId) {
      throw new AppError("Sales ID is required for generating file URL.", 400);
    }
    return `/uploads/${uploadType}/${salesId}/${filename}`;
  },
  profilePicture: (uploadType, req, filename) => {
    let entityType, entityId;

    if (req.baseUrl.includes("employees")) {
      entityType = "employees";
      entityId = req.params.id || "temp";
    } else if (req.baseUrl.includes("companies")) {
      entityType = "companies";
      entityId = req.params.id;
    } else if (req.baseUrl.includes("vendors")) {
      entityType = "vendors";
      entityId = req.params.id;
    }

    return `/uploads/${entityType}/${entityId}/profile/${filename}`;
  },
};

const createUploadMiddleware2 = (uploadType) => {
  let storage;

  if (uploadType === "salesContracts") {
    // Use memory storage for salesContracts
    storage = multer.memoryStorage();
  } else {
    return "Error";
  }

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 16 * 1024 * 1024, // 16MB
    },
  });

  // For salesContracts, handle single file named 'attachment'
  if (uploadType === "salesContracts") {
    return upload.single("attachment");
  }

  // For other types, adjust as needed (e.g., multiple files)
  return upload.single("attachment");
};

const createUploadMiddleware3 = (uploadType) => {
  // For signatures, use memory storage instead of disk storage
  const multer = require("multer");
  const storage = multer.memoryStorage(); // Use memory storage for signatures
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 16 * 1024 * 1024, // 16MB limit
    },
  });

  const uploadSingle = upload.single("attachment");

  const handleFileUpload = async (req, res, next) => {
    uploadSingle(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(
            new AppError("File is too large. Maximum file size is 16MB.", 400)
          );
        }
        return next(new AppError("File upload error", 400));
      } else if (err) {
        return next(err);
      }

      if (req.file) {
        try {
          const documentType = req.body.documentType;
          if (documentType === "signature") {
            // For signatures, convert buffer to base64
            const base64Data = req.file.buffer.toString("base64");
            req.body.signature = `data:${req.file.mimetype};base64,${base64Data}`;
          } else {
            // For other documents, use your existing URL generator
            const urlGenerator =
              urlGenerators[documentType] || urlGenerators.default;
            req.file.url = urlGenerator(documentType, req, req.file.filename);
            req.file.path = req.file.url.replace(/^\//, "");
          }
        } catch (error) {
          console.error("File processing error:", error);
          return next(new AppError("Error processing uploaded file", 500));
        }
      }
      next();
    });
  };

  return handleFileUpload;
};

const createUploadMiddleware = (uploadType) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        const pathGenerator =
          pathGenerators[uploadType] || pathGenerators.default;
        const uploadPath = pathGenerator(uploadType, req);
        createUploadDir(uploadPath);
        cb(null, uploadPath);
      } catch (error) {
        cb(error);
      }
    },
    filename: (req, file, cb) => {
      const fileExtension = path.extname(file.originalname).toLowerCase();
      const filename = `${uploadType}-${generateUniqueId()}${fileExtension}`;
      cb(null, filename);
    },
  });

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 16 * 1024 * 1024,
    },
  });

  const uploadSingle = upload.single("attachment");

  const handleFileUpload = (req, res, next) => {
    uploadSingle(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(
            new AppError("File is too large. Maximum file size is 16MB.", 400)
          );
        }
        return next(new AppError("File upload error", 400));
      } else if (err) {
        return next(err);
      }

      if (req.file) {
        const urlGenerator = urlGenerators[uploadType] || urlGenerators.default;
        req.file.url = urlGenerator(uploadType, req, req.file.filename);

        // Store relative path from public directory
        req.file.path = req.file.url.replace(/^\//, "");
      }

      next();
    });
  };

  return handleFileUpload;
};

// Middleware for handling bulk file uploads
const createBulkUploadMiddleware = (uploadType) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        const pathGenerator =
          pathGenerators[uploadType] || pathGenerators.default;
        const uploadPath = pathGenerator(uploadType, req);
        createUploadDir(uploadPath);
        cb(null, uploadPath);
      } catch (error) {
        cb(error);
      }
    },
    filename: (req, file, cb) => {
      const fileExtension = path.extname(file.originalname).toLowerCase();
      const filename = `${uploadType}-${generateUniqueId()}${fileExtension}`;
      cb(null, filename);
    },
  });

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 32 * 1024 * 1024, // 16MB limit per file
    },
  });

  const uploadArray = upload.array("attachment", 10); // Max 10 files at a time

  const handleFileUpload = (req, res, next) => {
    uploadArray(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(
            new AppError(
              "One or more files are too large. Maximum size is 32MB.",
              400
            )
          );
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          return next(new AppError("Too many files. Maximum is 10.", 400));
        }
        return next(new AppError("File upload error", 400));
      } else if (err) {
        return next(err);
      }

      if (req.files && req.files.length > 0) {
        const urlGenerator = urlGenerators[uploadType] || urlGenerators.default;

        // Attach URLs and paths to each file
        req.files.forEach((file) => {
          file.url = urlGenerator(uploadType, req, file.filename);
          file.path = file.url.replace(/^\//, "");
        });
      }

      next();
    });
  };

  return handleFileUpload;
};

const moveFilesToPermanentLocation = async (
  tempPath,
  employeeId,
  attachments
) => {
  if (!fs.existsSync(tempPath)) return attachments;

  const permanentPath = path.join(
    baseUploadDir,
    "employees",
    employeeId.toString(),
    "documents"
  );
  createUploadDir(permanentPath);

  // Update paths in attachments object
  const updatedAttachments = { ...attachments };
  for (const [docType, fileInfo] of Object.entries(attachments)) {
    if (fileInfo && fileInfo.path) {
      const fileName = path.basename(fileInfo.path);
      const oldPath = path.join("public", fileInfo.path);
      const newPath = path.join(permanentPath, fileName);

      // Move file
      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
      }

      // Update path and URL in attachments
      updatedAttachments[docType] = {
        path: `uploads/employees/${employeeId}/documents/${fileName}`,
        url: `/uploads/employees/${employeeId}/documents/${fileName}`,
      };
    }
  }

  // Clean up temp directory
  fs.rmSync(tempPath, { recursive: true, force: true });
  return updatedAttachments;
};

// Create middleware for different upload types
const uploadMiddleware = {
  bulkDocuments: createBulkUploadMiddleware("orders"),
  orders: createUploadMiddleware("orders"),
  documents: createUploadMiddleware("documents"),
  tickets: createUploadMiddleware("tickets"),
  employeeDocuments: createUploadMiddleware("employeeDocuments"),
  vendors: createUploadMiddleware("vendors"),
  companies: createUploadMiddleware("companies"),
  profilePicture: createUploadMiddleware("profilePicture"),
  salesContracts: createUploadMiddleware2("salesContracts"),
  signature: createUploadMiddleware3("signature"),
  passport: createUploadMiddleware("passport"),
};

module.exports = {
  uploadMiddleware,
  baseUploadDir,
  createUploadDir,
  createUploadMiddleware,
  // Export generators to allow adding new path patterns
  pathGenerators,
  urlGenerators,
  moveFilesToPermanentLocation,
};
