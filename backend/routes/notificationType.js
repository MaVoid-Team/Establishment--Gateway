const express = require("express");
const notificationController = require("../controllers/notificationsController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(notificationController.getAllNotificationTypes)
  .post(notificationController.createNotificationType);

router
    .route("/:id") 
    .get(notificationController.getNotificationType)
    .patch(notificationController.updateNotificationType)
    .delete(notificationController.deleteNotificationType);

    
module.exports = router;  