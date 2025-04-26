const express = require("express");
const orderController = require("../controllers/orderController");
const router = express.Router();
const { uploadMiddleware } = require("../utils/Upload");
const authController = require("../controllers/authController");

router.use(authController.requireAuth);

router
  .route("/")
  .post(
    authController.authorize([2, 3, 4, 5, 6, 7]),
    uploadMiddleware.bulkDocuments,
    orderController.createOrder
  )
  .get(authController.authorize([3, 4, 5, 6, 7]), orderController.getAllOrders);

router.route("/awaitedOrders").get(
  // authController.authorize([2,3,4,5,6,7]) ,
  orderController.findOrdersByRole
);

router
  .route("/:orderId")
  .get(
    authController.authorize([2, 3, 4, 5, 6, 7]),
    orderController.getOrderByID
  )
  .patch(
    //     authController.authorize([3, 4, 5, 6, 7]),
    orderController.handleRoleDecision
  )
  .delete(authController.authorize([6, 7]), orderController.deleteOrder)
  .put(
    authController.authorize([3, 4, 5, 6, 7]),
    uploadMiddleware.bulkDocuments,
    orderController.updateOrder
  );

router
  .route("/delivery/:orderID")
  .patch(
    authController.authorize([3, 4, 5, 6, 7]),
    orderController.updateDeliveryDate
  );

module.exports = router;
