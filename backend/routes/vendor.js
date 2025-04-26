const express = require("express");
const vendorController = require("../controllers/vendorController");
const router = express.Router();
const authController = require("../controllers/authController");
const { uploadMiddleware } = require("../utils/Upload");

router.use(authController.requireAuth);

router
  .route("/")
  .get(
    // authController.authorize([2, 3, 4, 5, 6, 7]),
    vendorController.getallVendors
  )
  .post(
    authController.authorize([2, 3, 4, 5, 6, 7]),
    uploadMiddleware.vendors,
    vendorController.createVendor
  );

router
  .route("/:id")
  .get(
    authController.authorize([2, 3, 4, 5, 6, 7]),
    vendorController.getVendorById
  )
  .patch(
    authController.authorize([6, 7]),
    uploadMiddleware.vendors,
    vendorController.updateVendor
  )
  .delete(authController.authorize([6, 7]), vendorController.deleteVendor);

router
  .route("/signature/:id")
  .patch(uploadMiddleware.signature, vendorController.updateVendor);

module.exports = router;
