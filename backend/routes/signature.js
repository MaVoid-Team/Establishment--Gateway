const express = require("express");
const signatureController = require("../controllers/signatureController");
const authController = require("../controllers/authController");
const router = express.Router();

router.use(authController.requireAuth);

router.get(
  "/getSignerAndObject",
  signatureController.getSignerAndObjectByToken
);
router.post("/submit", signatureController.submitSignature);

router.get("/signer", signatureController.getSignaturesBySignerTypeAndId);

router
  .route("/")
  .post(
    authController.authorize([2, 3, 4, 5, 6, 7]),
    signatureController.createSignature
  )
  .get(
    authController.authorize([3, 4, 5, 6, 7]),
    signatureController.getAllSignatures
  );

router
  .route("/:id")
  .get(
    authController.authorize([2, 3, 4, 5, 6, 7]),
    signatureController.getSignatureById
  )
  .patch(authController.authorize([6, 7]), signatureController.updateSignature)
  .delete(
    authController.authorize([6, 7]),
    signatureController.deleteSignature
  );

module.exports = router;
