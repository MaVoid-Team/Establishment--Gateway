const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.patch("/changepassword", authController.changePassword);
router.post("/forgetpassword", authController.forgotPassword);
router.patch("/forgetpassword/:id", authController.forgotPasswordById);
router.post("/resetPassword/:token", authController.resetPassword);

module.exports = router;
