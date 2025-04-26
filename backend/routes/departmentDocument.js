const express = require("express");
const router = express.Router();
const departmentDocumentController = require("../controllers/departmentDocumentController"); // Import controller
const authController = require('../controllers/authController')

router.use(authController.requireAuth)

router.route("/").get(
  authController.authorize([3,4,5,6,7]),
  departmentDocumentController.getDocumentsForEmployee);
// Get all documents for a specific department
router.get(
  "/:departmentId/documents",
  authController.authorize([3,4,5,6,7]),
  departmentDocumentController.getDocumentsForDepartment
);

// Get all departments for a specific document
router.get(
  "/:documentId/departments",
  authController.authorize([3,4,5,6,7]),
  departmentDocumentController.getDepartmentsForDocument
);

// Add a document to a department
router.post("/add", 
  authController.authorize([6,7]),
  departmentDocumentController.addDocumentToDepartment);

// Remove a document from a department
router.delete(
  "/:departmentId/documents/:documentId",
  authController.authorize(6,7),
  departmentDocumentController.removeDocumentFromDepartment
);

module.exports = router;
