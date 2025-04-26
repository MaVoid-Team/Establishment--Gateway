const fs = require('fs');
const convertToBase64 = (file) => {
    const bitmap = fs.readFileSync(file.path);
    return `data:${file.mimetype};base64,${bitmap.toString('base64')}`;
  };


module.exports = convertToBase64;


// const createUploadMiddleware = (uploadType) => {
//   // For signatures, use memory storage instead of disk storage
//   const multer = require('multer');

//   const storage = multer.memoryStorage(); // Use memory storage for signatures
  
//   const upload = multer({
//     storage: storage,
//     limits: {
//       fileSize: 16 * 1024 * 1024, // 16MB limit
//     },
//   });
  
//   const uploadSingle = upload.single('file');
  
//   const handleFileUpload = async (req, res, next) => {
//     uploadSingle(req, res, async (err) => {
//       if (err instanceof multer.MulterError) {
//        if (err.code === "LIMIT_FILE_SIZE") {
//           return next(new AppError("File is too large. Maximum file size is 16MB.", 400));
//         }
//         return next(new AppError("File upload error", 400));
//       } else if (err) {
//         return next(err);
//       }
  
//       if (req.file) {
//         try {
//           const documentType = req.body.documentType;
          
//           if (documentType === "signature") {
//             // For signatures, convert buffer to base64
//             const base64Data = req.file.buffer.toString('base64');
//             req.body.signature = `data:${req.file.mimetype};base64,${base64Data}`;
//           } else {
//             // For other documents, use your existing URL generator
//             const urlGenerator = urlGenerators[documentType] || urlGenerators.default;
//             req.file.url = urlGenerator(documentType, req, req.file.filename);
//             req.file.path = req.file.url.replace(/^\//, "");
//           }
//         } catch (error) {
//           console.error("File processing error:", error);
//           return next(new AppError("Error processing uploaded file", 500));
//         }
//       }
//       next();
//     });
//   };

//   return handleFileUpload;
// };




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

//     // Handle document upload if a file was uploaded
//     if (req.file) {
//       const documentType = req.body.documentType;
//       if (!["nationalId", "passport", "residencyPermit",'profilePic', 'signature'].includes(documentType)
//       ) {
//         return next(new AppError("Invalid document type", 400));
//       }

//       // Get current attachments or initialize with all document types
//       const currentAttachments = employee.attachment || {
//         nationalId: null,
//         passport: null,
//         residencyPermit: null,
//         profilePic: null,
//         backup: null
//       };

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