const { Department, Document } = require("../models/assosciations");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

// Get all documents for a specific department
const getDocumentsForDepartment = catchAsync(async (req, res, next) => {
  const departmentId = req.params.departmentId;
  console.log(departmentId);
  const department = await Department.findByPk(departmentId, {
    where: { id: departmentId },
    include: {
      model: Document,
      as: "documents",
    },
  });

  if (!department) {
    return next(new AppError("Department not found", 404));
  }

  res.status(200).json({
    status: "success",
    results: department.documents.length,
    data: { documents: department.documents }, // Access associated documents
  });
});

// Get all documents for the department assigned to an employee
const getDocumentsForEmployee = catchAsync(async (req, res, next) => {
  if (!req.session.user) {
    return next(new AppError("Unauthorized", 401));
  }

  const department = await Department.findOne({
    where: { id: req.session.user.department },
    include: {
      model: Document,
      as: "documents",
    },
  });

  if (!department) {
    return next(new AppError("Department not found", 404));
  }

  res.status(200).json({
    status: "success",
    results: department.documents.length,
    data: { documents: department.documents },
  });
});

// Get all departments associated with a specific document
const getDepartmentsForDocument = catchAsync(async (req, res, next) => {
  const document = await Document.findOne({
    where: { id: req.params.documentId },
    include: {
      model: Department,
      as: "departments", // Alias used in the association
    },
  });

  if (!document) {
    return next(new AppError("Document not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: document.departments, // Return all associated departments
  });
});

// Add a document to a department
const addDocumentToDepartment = catchAsync(async (req, res, next) => {
  const { department_id, document_id } = req.body;

  const department = await Department.findByPk(department_id);
  const document = await Document.findByPk(document_id);

  if (!department || !document) {
    return next(new AppError("Department or Document not found", 404));
  }

  await department.addDocument(document); // Using Sequelize's built-in method for many-to-many

  res.status(201).json({
    status: "success",
    message: "Document added to department successfully",
  });
});

// Remove a document from a department
const removeDocumentFromDepartment = catchAsync(async (req, res, next) => {
  const { departmentId, documentId } = req.params;

  const department = await Department.findByPk(departmentId);
  const document = await Document.findByPk(documentId);

  if (!department || !document) {
    return next(new AppError("Department or Document not found", 404));
  }

  await department.removeDocument(document); // Using Sequelize's built-in method for many-to-many

  res.status(200).json({
    status: "success",
    message: "Document removed from department successfully",
  });
});

module.exports = {
  getDocumentsForDepartment,
  getDocumentsForEmployee,
  getDepartmentsForDocument,
  addDocumentToDepartment,
  removeDocumentFromDepartment,
};
