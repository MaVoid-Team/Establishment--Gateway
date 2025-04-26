const express = require("express");
const companyController = require("../controllers/companyController");
const router = express.Router();
const authController = require("../controllers/authController");
const { uploadMiddleware } = require("../utils/Upload");
// router.route("/:id").get(companyController.getCompanyById);

router.use(authController.requireAuth);

router
  .route("/")
  .get(
    authController.authorize([2, 3, 4, 5, 6, 7]),
    companyController.getallCompanies
  )
  .post(
    authController.authorize([2, 3, 4, 5, 6, 7]), uploadMiddleware.companies,
    companyController.createCompany
  );

router
  .route("/:id")
  .get(
    authController.authorize([2, 3, 4, 5, 6, 7]),
    companyController.getCompanyById
  )
  .patch(
    authController.authorize([3, 4, 5, 6, 7]), uploadMiddleware.companies,
    companyController.updateCompany
  )
  .delete(authController.authorize([6, 7]), companyController.deleteCompany);

router
  .route("/signature/:id")
  .patch(
    uploadMiddleware.signature,
    companyController.updateCompany)

module.exports = router;
