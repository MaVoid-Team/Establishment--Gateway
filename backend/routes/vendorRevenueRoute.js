// routes/vendorRevenueRoutes.js
const express = require("express");
const vendorRevenueController = require("../controllers/vendorRevenueController");
const authController = require("../controllers/authController");
const router = express.Router();

router.use(authController.requireAuth);


// Route to get all vendor revenue summaries
router.get(
  "/vendorRevenues",
  authController.authorize([5, 6, 7]),
  vendorRevenueController.getAllVendorRevenueSummaries
);

// Route to get a single vendor revenue summary by vendor ID
router.get(
  "/vendorRevenues/:vendor_id",
  authController.authorize([5, 6, 7]),
  vendorRevenueController.getVendorRevenueById
);

module.exports = router;
