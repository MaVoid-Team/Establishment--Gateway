const express = require("express");
const notificationController = require("../controllers/notificationsController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.requireAuth);

router
  .route("/")
  // .get(

  //   notificationController.getNotificationsForUser
  // )
  .post(notificationController.createAndSendNotification)
  .patch(notificationController.markAsRead);
// router.route("/:id").get(

//   notificationController.getNotificationsForUser
// );

module.exports = router;
