// routes/companyRevenueRoutes.js
const express = require("express");
const companyRevenueController = require("../controllers/companyRevenueController");
const authController = require("../controllers/authController");
const router = express.Router();


router.use(authController.requireAuth);


// Route to get all company revenue summaries
router.get(
  "/companyRevenues",
  authController.authorize([5, 6, 7]),
  companyRevenueController.getAllCompanyRevenueSummaries
);

// Route to get a single company revenue summary by company ID
router.get(
  "/companyRevenues/:company_id",
  authController.authorize([5, 6, 7]),
  companyRevenueController.getCompanyRevenueSummaryById
);

module.exports = router;
