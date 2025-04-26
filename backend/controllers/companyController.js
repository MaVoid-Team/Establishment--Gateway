const catchAsync = require("../utils/catchAsync");
const Company = require("../models/companyModel");
const AppError = require("../utils/AppError");
const fs = require("fs");
const path = require("path");
const Signature = require("../models/signatures");
const restrict = require("../utils/restrictions");

exports.getallCompanies = catchAsync(async (req, res, next) => {
  const data = await restrict(Company, req.session.user.role, [
    "id",
    "name",
    "email",
  ]);

  const companies = data ? data : await Company.findAll();
  res.status(200).json({
    status: "success",
    data: {
      companies,
    },
  });
});

exports.getCompanyById = catchAsync(async (req, res, next) => {
  const companyId = req.params.id;
  const company = await Company.findByPk(companyId, {
    include: [
      {
        model: Signature,
        as: "signatures",
        required: false,
      },
    ],
  });
  if (!company) {
    return next(new AppError("Company Not Found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      company,
    },
  });
});

exports.createCompany = catchAsync(async (req, res, next) => {
  try {
    // Initialize attachments object with all possible document types
    let attachments = {
      CR: null,
      VAT: null,
      profilePic: null,
      backup: null,
      // Add other document types as needed
    };

    // Handle document upload if a file was uploaded
    if (req.file) {
      const documentType = req.body.documentType;
      if (
        !["CR", "VAT", "profilePic", "signature", "backup"].includes(
          documentType
        )
      ) {
        // Update as per your document types
        return next(new AppError("Invalid document type", 400));
      }

      // Update only the specific document while keeping others as null
      attachments[documentType] = {
        path: req.file.path,
        url: req.file.url,
      };
    }

    // Add attachments to request body
    req.body.attachment = attachments;

    // Create the new company
    let company = await Company.create(req.body);

    res.status(201).json({
      status: "success",
      data: { company },
    });
  } catch (error) {
    // No need to handle temporary files as companies do not use temp storage
    if (req.file && req.file.path) {
      // Delete the uploaded file in case of error to prevent orphaned files
      fs.unlink(path.join(__dirname, "..", "public", req.file.path), (err) => {
        if (err)
          console.error(`Failed to delete file at ${req.file.path}:`, err);
      });
    }

    if (error.name === "SequelizeValidationError") {
      const notNullErrors = error.errors
        .filter((err) => err.type === "notNull Violation")
        .map((err) => ({
          field: err.path,
          message: `${err.path} is required`,
        }));

      if (notNullErrors.length > 0) {
        return res.status(400).json({
          status: "fail",
          errors: notNullErrors,
        });
      }
    }

    next(error); // Pass the error to the global error handler
  }
});
// Update Company
exports.updateCompany = catchAsync(async (req, res, next) => {
  try {
    const companyId = req.params.id;
    let company = await Company.findByPk(companyId);

    if (!company) {
      return next(new AppError("Company Not Found", 404));
    }

    // Handle document upload if a file was uploaded
    if (req.file) {
      const documentType = req.body.documentType;
      if (
        !["CR", "VAT", "profilePic", "signature", "backup"].includes(
          documentType
        )
      ) {
        // Update as per your document types
        return next(new AppError("Invalid document type", 400));
      }

      // Get current attachments or initialize with all document types
      if (documentType !== "signature" && req.file) {
        const currentAttachments = company.attachment || {
          national_ID: null,
          residence_ID: null,
          profilePic: null,
          backup: null,
        };

        // // Delete old file if it exists
        // if (currentAttachments[documentType] && currentAttachments[documentType].path) {
        //   const oldFilePath = path.join(__dirname, '..', 'public', currentAttachments[documentType].path);
        //   fs.unlink(oldFilePath, (err) => {
        //     if (err) {
        //       console.error(`Failed to delete old file: ${oldFilePath}`, err);
        //       // Optionally, you can handle this error further
        //     }
        //   });
        // }

        // Create new attachments object preserving existing documents
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
    }

    // Update company with all changes
    await company.update(req.body);

    res.status(200).json({
      status: "success",
      data: { company },
    });
  } catch (error) {
    // No temporary files to handle here
    console.error("Error in updateCompany:", error);
    next(error);
  }
});

exports.deleteCompany = catchAsync(async (req, res, next) => {
  const companyId = req.params.id;
  const company = await Company.findByPk(companyId);
  if (!company) {
    return next(new AppError("Company Not Found", 404));
  }
  await company.destroy();
  res.status(204).json({
    status: "success",
    data: null,
  });
});
