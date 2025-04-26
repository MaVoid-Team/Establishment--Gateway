const express = require("express");
const router = express.Router();
const salesContractController = require("../controllers/salesContractsController");
const authController = require("../controllers/authController");
const { uploadMiddleware } = require("../utils/Upload");

router.use(authController.requireAuth);

// Base routes
router
  .route("/")
  .get(
    authController.authorize([3, 4, 5, 6, 7]),
    salesContractController.getAllSalesContracts
  )
  .post(
    authController.authorize([7]),
    uploadMiddleware.salesContracts,
    salesContractController.createSalesContract
  );

// Individual contract routes
router
  .route("/:id")
  .get(
    authController.authorize([3, 4, 5, 6, 7]),
    salesContractController.getSalesContract
  )
  .patch(
    authController.authorize([7]),
    uploadMiddleware.salesContracts,
    salesContractController.updateSalesContract
  )
  .delete(
    authController.authorize([6, 7]),
    salesContractController.deleteSalesContract
  );

module.exports = router;