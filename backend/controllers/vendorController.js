const Vendor = require("../models/vendorModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const fs = require("fs");
const path = require("path");
const Signature = require("../models/signatures");
const restrict = require("../utils/restrictions");

exports.getallVendors = catchAsync(async (req, res, next) => {
  const data = await restrict(Vendor, req.session.user.role, [
    "id",
    "name",
    "email",
  ]);
  const vendors = data ? data : await Vendor.findAll();
  res.status(200).json({
    status: "success",
    data: { vendors },
  });
});

exports.getVendorById = catchAsync(async (req, res, next) => {
  const vendorId = req.params.id;
  const vendor = await Vendor.findByPk(vendorId, {
    include: [
      {
        model: Signature,
        as: "signatures",
        required: false,
      },
    ],
  });
  if (!vendor) {
    return next(new AppError("vendor Not Found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      vendor,
    },
  });
});

exports.createVendor = catchAsync(async (req, res, next) => {
  try {
    // Initialize attachments object with all possible document types
    let attachments = {
      national_ID: null,
      residence_ID: null,
      profilePic: null,
      backup: null,
      // Add other document types as needed
    };

    // Handle document upload if a file was uploaded
    if (req.file) {
      const documentType = req.body.documentType;
      if (
        ![
          "national_ID",
          "residence_ID",
          "profilePic",
          "signature",
          "backup",
        ].includes(documentType)
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

    // Create the new vendor
    let vendor = await Vendor.create(req.body);

    res.status(201).json({
      status: "success",
      data: { vendor },
    });
  } catch (error) {
    // No need to handle temporary files as vendors do not use temp storage
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
// Update Vendor
// exports.updateVendor = catchAsync(async (req, res, next) => {
//   try {
//     const vendorId = req.params.id;
//     let vendor = await Vendor.findByPk(vendorId);

//     if (!vendor) {
//       return next(new AppError("Vendor Not Found", 404));
//     }

//     // Handle document upload if a file was uploaded
//     if (req.file) {
//       const documentType = req.body.documentType;
//       if (!["national_ID", "residence_ID" , 'profilePic' ,'vendor_signature'].includes(documentType)) {
//         // Update as per your document types
//         return next(new AppError("Invalid document type", 400));
//       }

//       // Get current attachments or initialize with all document types
//       const currentAttachments = vendor.attachment || {
//         national_ID:null ,
//         residence_ID : null,
//         profilePic: null,
//         vendor_signature : null
//         // Add other document types as needed
//       };

//       // Delete old file if it exists
//       if (
//         currentAttachments[documentType] &&
//         currentAttachments[documentType].path
//       ) {
//         const oldFilePath = path.join(
//           __dirname,
//           "..",
//           "public",
//           currentAttachments[documentType].path
//         );
//         fs.unlink(oldFilePath, (err) => {
//           if (err) {
//             console.error(`Failed to delete old file: ${oldFilePath}`, err);
//             // Optionally, you can handle this error further
//           }
//         });
//       }

//       // Create new attachments object preserving existing documents
//       req.body.attachment = {
//         ...currentAttachments, // Spread existing attachments first
//         [documentType]: {
//           // Then update only the specific document
//           path: req.file.path,
//           url: req.file.url,
//         },
//       };
//     }

//     // Update vendor with all changes
//     await vendor.update(req.body);

//     res.status(200).json({
//       status: "success",
//       data: { vendor },
//     });
//   } catch (error) {
//     // No temporary files to handle here
//     console.error("Error in updateVendor:", error);
//     next(error);
//   }
// });

exports.updateVendor = catchAsync(async (req, res, next) => {
  try {
    const vendorId = req.params.id;
    let vendor = await Vendor.findByPk(vendorId);

    if (!vendor) {
      return next(new AppError("Vendor Not Found", 404));
    }

    // Handle file upload or signature update
    if (req.file) {
      const documentType = req.body.documentType;

      // Validate document type
      if (
        ![
          "national_ID",
          "residence_ID",
          "profilePic",
          "signature",
          "backup",
        ].includes(documentType)
      ) {
        return next(new AppError("Invalid document type", 400));
      }

      // If it's not a signature, handle it as a regular file upload
      if (documentType !== "signature" && req.file) {
        const currentAttachments = vendor.attachment || {
          national_ID: null,
          residence_ID: null,
          profilePic: null,
          backup: null,
        };

        // Delete old file if it exists
        // if (currentAttachments[documentType] && currentAttachments[documentType].path) {
        //   const oldFilePath = path.join(__dirname, '..', 'public', currentAttachments[documentType].path);
        //   fs.unlink(oldFilePath, (err) => {
        //     if (err) {
        //       console.error(`Failed to delete old file: ${oldFilePath}`, err);
        //     }
        //   });
        // }

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
      // The signature is already in req.body.signature from the upload middleware
    }

    // Update vendor with all changes
    await vendor.update(req.body);

    res.status(200).json({
      status: "success",
      data: { vendor },
    });
  } catch (error) {
    console.error("Error in updateVendor:", error);
    next(error);
  }
});

exports.deleteVendor = catchAsync(async (req, res, next) => {
  const vendorId = req.params.id;
  const vendor = await Vendor.findByPk(vendorId);
  if (!vendor) {
    return next(new AppError("Company Not Found", 404));
  }
  await vendor.destroy();
  res.status(204).json({
    status: "success",
    data: null,
  });
});
