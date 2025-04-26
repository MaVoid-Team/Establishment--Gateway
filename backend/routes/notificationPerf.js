const express = require("express");
const notificationController = require("../controllers/notificationsController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(notificationController.getAllNotificationPreferences)
  .post(notificationController.createNotificationPreference)
  .patch(notificationController.updateNotificationPreferences)

router
  .route("/:employeeId") 
  .get(notificationController.getNotificationPreferencesByEmployeeId)
  
  module.exports = router;  