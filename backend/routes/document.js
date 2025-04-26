const express = require("express");
const { uploadMiddleware } = require("../utils/Upload");
const router = express.Router();
const documentController = require("../controllers/documentController"); // Import controller
const authController = require("../controllers/authController");


router.use(authController.requireAuth);

router
  .route("/")
  .get(
    authController.authorize([3, 4, 5, 6, 7]),
    documentController.getAllDocuments
  );
router.route("/stats").get(documentController.getTotals);

router
  .route("/:id")
  .get(
    authController.authorize([3, 4, 5, 6, 7]),
    documentController.getDocumentById
  )
  .patch(
    authController.authorize([7]),
    uploadMiddleware.documents,
    documentController.updateDocument
  )
  .delete(authController.authorize([6, 7]), documentController.deleteDocument)
  .post(
    authController.authorize([7]),
    uploadMiddleware.documents,
    documentController.createDocument
  );

module.exports = router;
