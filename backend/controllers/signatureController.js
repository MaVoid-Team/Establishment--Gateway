const Signature = require("../models/signatures");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const SignatureLog = require("../models/signatureLogModel");
const Employee = require("../models/employeeModel");
const Vendor = require("../models/vendorModel");
const Company = require("../models/companyModel");
const Order = require("../models/orderModel");
const Document = require("../models/document");
const SalesContract = require("../models/salesContracts");
const Role = require("../models/roleModel");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const sendMail = require("../utils/email");
// Helper function to get the signer and role
const getSignerDetails = async (signature) => {
  let signer;
  switch (signature.signer_type) {
    case "employee":
      signer = await Employee.findByPk(signature.signer_id, {
        include: [{ model: Role, as: "employeeRole", attributes: ["name"] }],
      });
      break;
    case "vendor":
      signer = await Vendor.findByPk(signature.signer_id, {
        include: [{ model: Role, as: "vendorRole", attributes: ["name"] }],
      });
      break;
    case "company":
      signer = await Company.findByPk(signature.signer_id, {
        include: [{ model: Role, as: "companyRole", attributes: ["name"] }],
      });
      break;
    default:
      signer = null;
  }

  return {
    signer_email: signer?.email || "Unknown",
    role: signer?.[`${signature.signer_type}Role`]?.name || "Unknown",
  };
};

exports.getAllSignatures = catchAsync(async (req, res, next) => {
  const signatures = await Signature.findAll();
  res.status(200).json({
    status: "success",
    results: signatures.length,
    data: {
      signatures,
    },
  });
});

exports.getSignatureById = catchAsync(async (req, res, next) => {
  const signatureId = req.params.id;
  const signature = await Signature.findByPk(signatureId);
  if (!signature) {
    return next(new AppError("Signature Not Found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      signature,
    },
  });
});

exports.getSignaturesBySignerTypeAndId = catchAsync(async (req, res, next) => {
  const { signer_type, signer_id } = req.query;

  // Validate signer_type
  if (!["employee", "vendor", "company"].includes(signer_type)) {
    return next(new AppError("Invalid signer type", 400));
  }

  // Validate signer_id
  if (!signer_id) {
    return next(new AppError("Signer ID is required", 400));
  }

  const signatures = await Signature.findAll({
    where: {
      signer_type,
      signer_id,
    },
  });

  res.status(200).json({
    status: "success",
    results: signatures.length,
    data: {
      signatures,
    },
  });
});

exports.createSignature = catchAsync(async (req, res, next) => {
  const { signer_type, signer_id, object_type, object_id, signature_data } =
    req.body;

  // Validate signer_type
  if (!["employee", "vendor", "company"].includes(signer_type)) {
    return next(new AppError("Invalid signer type", 400));
  }

  // Validate signer_id based on signer_type
  let signer;
  switch (signer_type) {
    case "employee":
      signer = await Employee.findByPk(signer_id);
      break;
    case "vendor":
      signer = await Vendor.findByPk(signer_id);
      break;
    case "company":
      signer = await Company.findByPk(signer_id);
      break;
  }

  if (!signer) {
    return next(
      new AppError(
        `${
          signer_type.charAt(0).toUpperCase() + signer_type.slice(1)
        } not found`,
        404
      )
    );
  }

  // Validate object_type and object_id if provided
  let object;
  if (object_type && object_id) {
    if (!["order", "document", "sales_contract"].includes(object_type)) {
      return next(new AppError("Invalid object type", 400));
    }

    switch (object_type) {
      case "order":
        object = await Order.findByPk(object_id);
        break;
      case "document":
        object = await Document.findByPk(object_id);
        break;
      case "sales_contract":
        object = await SalesContract.findByPk(object_id);
        break;
    }

    if (!object) {
      return next(
        new AppError(
          `${
            object_type.charAt(0).toUpperCase() + object_type.slice(1)
          } not found`,
          404
        )
      );
    }
  } else if ((object_type && !object_id) || (!object_type && object_id)) {
    // If one of the object_type or object_id is provided, but not both
    return next(
      new AppError(
        "Both object_type and object_id must be provided together",
        400
      )
    );
  }

  if (signer_type === "employee") {
    const signature = await Signature.create({
      signer_type,
      signer_id,
      object_type: object_type || null,
      object_id: object_id || null,
      signature_data,
      signed_at: new Date(),
    });

    return res.status(201).json({
      status: "success",
      data: {
        signature,
      },
    });
  }

  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Expires in 7 days

  const signature = await Signature.create({
    signer_type,
    signer_id,
    object_type: object_type || null,
    object_id: object_id || null,
    token,
    expires_at: expiresAt,
    // Initialize other fields as needed
  });

  // Generate the unique link
  const signatureLink = `${process.env.FRONTEND_URL}/sign/${token}`;
  const emailOptions = {
    email: signer.email,
    subject: "Signature Request",
    message: `Please provide your signature by visiting the following link: ${signatureLink}`,
    html: `
      <p>Dear ${signer.name || signer.email},</p>
      <p>You have been requested to provide a signature. Please click the link below to complete the process:</p>
      <a href="${signatureLink}" target="_blank">Sign Now</a>
      <p>This link will expire on ${expiresAt.toLocaleString()}.</p>
      <p>Thank you!</p>
    `,
  };
  // Send the email
  try {
    await sendMail(emailOptions);
  } catch (error) {
    console.error("Error sending email:", error.message);
    return next(
      new AppError("Error sending email. Please try again later.", 500)
    );
  }
  res.status(201).json({
    status: "success",
    data: {
      signature,
      signatureLink, // Optionally return the link for confirmation
    },
  });
});

exports.updateSignature = catchAsync(async (req, res, next) => {
  const signatureId = req.params.id;
  const signature = await Signature.findByPk(signatureId);
  if (!signature) {
    return next(new AppError("Signature Not Found", 404));
  }
  // Fetch the old data
  const oldData = signature.toJSON();

  if (!oldData) {
    return next(new AppError("Signature Not Found", 404));
  }
  const { signer_email, role } = await getSignerDetails(signature);

  await signature.update(req.body);

  // Log update
  await SignatureLog.create({
    signature_id: signature.id,
    signer_email,
    performed_by: req.session.user.id,
    operation_type: "UPDATE",
    old_data: oldData,
    new_data: signature,
  });

  res.status(200).json({
    status: "success",
    data: {
      signature,
    },
  });
});

exports.deleteSignature = catchAsync(async (req, res, next) => {
  const signatureId = req.params.id;
  const signature = await Signature.findByPk(signatureId);
  if (!signature) {
    return next(new AppError("Signature Not Found", 404));
  }

  const oldData = signature.toJSON();

  if (!oldData) {
    return next(new AppError("Signature Not Found", 404));
  }

  const { signer_email, role } = await getSignerDetails(signature);

  // Log deletion
  await SignatureLog.create({
    signature_id: signature.id,
    signer_email,
    performed_by: req.session.user.id,
    operation_type: "DELETE",
    old_data: oldData,
  });

  await signature.destroy();
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getSignerAndObjectByToken = catchAsync(async (req, res, next) => {
  const { token } = req.query;

  if (!token) {
    return next(new AppError("Token is required", 400));
  }

  const signature = await Signature.findOne({ where: { token } });

  if (!signature) {
    return next(new AppError("Invalid signature token", 404));
  }

  // Check if token has expired
  if (new Date() > signature.expires_at) {
    return next(new AppError("Signature link has expired", 400));
  }

  let signer;
  switch (signature.signer_type) {
    case "employee":
      signer = await Employee.findByPk(signature.signer_id, {
        attributes: ["id", "email", "name"],
      });
      break;
    case "vendor":
      signer = await Vendor.findByPk(signature.signer_id, {
        attributes: ["id", "email", "name"],
      });
      break;
    case "company":
      signer = await Company.findByPk(signature.signer_id, {
        attributes: ["id", "email", "name"],
      });
      break;
    default:
      signer = null;
  }

  if (!signer) {
    return next(new AppError("Signer not found", 404));
  }

  let object = null;
  if (signature.object_type && signature.object_id) {
    switch (signature.object_type) {
      case "order":
        object = await Order.findByPk(signature.object_id);
        break;
      case "document":
        object = await Document.findByPk(signature.object_id);
        break;
      case "sales_contract":
        object = await SalesContract.findByPk(signature.object_id);
        break;
      default:
        object = null;
    }

    if (!object) {
      return next(new AppError("Object not found", 404));
    }
  }

  res.status(200).json({
    status: "success",
    data: {
      signer,
      signer_type: signature.signer_type,
      object,
      object_type: signature.object_type,
    },
  });
});

exports.submitSignature = catchAsync(async (req, res, next) => {
  const { token, signature_data } = req.body;

  if (!token || !signature_data) {
    return next(new AppError("Invalid request data", 400));
  }

  const signature = await Signature.findOne({ where: { token } });

  if (!signature) {
    return next(new AppError("Invalid signature request", 404));
  }

  // Check if token has expired
  if (new Date() > signature.expires_at) {
    return next(new AppError("Signature link has expired", 400));
  }

  // Check if the signature has already been submitted
  if (signature.signature_data) {
    return next(new AppError("Signature has already been submitted", 400));
  }

  // Save the signature data
  signature.signature_data = signature_data;

  // Optionally, save the signature as an image file
  const base64Data = signature_data.replace(/^data:image\/png;base64,/, "");
  const fileName = `signature_${signature.id}_${Date.now()}.png`;
  const filePath = path.join(__dirname, "..", "public", "signatures", fileName);

  // Ensure the directory exists
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  fs.writeFileSync(filePath, base64Data, "base64");
  signature.signature_url = `${process.env.BACKEND_URL}/signatures/${fileName}`;

  await signature.save();

  const signerDetails = await getSignerDetails(signature);

  // Log the submission
  await SignatureLog.create({
    signature_id: signature.id,
    signer_email: signerDetails.signer_email,
    performed_by: signature.signer_id, // Could be Employee ID, Vendor ID, or Company ID
    operation_type: "CREATE",
    new_data: signature,
  });

  res.status(200).json({
    status: "success",
    data: {
      signature,
    },
  });
});
