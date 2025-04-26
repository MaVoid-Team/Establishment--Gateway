const express = require("express");
const roleController = require("../controllers/roleController");
const router = express.Router();
const authController = require("../controllers/authController");

router.use(authController.requireAuth);

router
  .route("/")
  .get(
    authController.authorize([3, 4, 5, 6, 7]), 
    roleController.getAllRoles
  )
  .post(
    authController.authorize([6, 7]),
    roleController.createRole
  );
router
  .route("/:id")
  .get(authController.authorize([3, 4, 5, 6, 7]), roleController.getAllRoles)
  .delete(authController.authorize([6, 7]), roleController.deleteRole)
  .patch(authController.authorize([6, 7]), roleController.updateRole);

module.exports = router;
