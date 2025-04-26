const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auditLogController = require("../controllers/auditLogController");

router.use(authController.requireAuth);

// Signature Logs
router
  .route("/signatures")
  .get(
    authController.authorize([6, 7]),
    auditLogController.getAllSignatureLogs
  );

// Document Logs
router
  .route("/documents")
  .get(
    authController.authorize([6, 7]), 
    auditLogController.getAllDocumentLogs
  );

// Order Logs
router
  .route("/orders")
  .get(
    authController.authorize([6, 7]),
    auditLogController.getAllOrderLogs
  );

router
  .route("/sales-contracts")
  .get(
    authController.authorize([6, 7]),
    auditLogController.getAllSalesContractLogs
);

module.exports = router;
