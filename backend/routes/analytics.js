// routes/analyticsRoutes.js
const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const authController = require("../controllers/authController");

router.use(authController.requireAuth);

router
  .route("/")

  .get(
    authController.authorize([5, 6, 7]),
    analyticsController.getAllAnalytics
  )
  .post(
    authController.authorize([6, 7]),
    analyticsController.createAnalytics
  );


router.post("/generate", 
  authController.authorize([6, 7]),
  analyticsController.generateAnalyticsForMonth
);

router.get("/:report_date", 
  authController.authorize([3, 4, 5, 6, 7]),
  analyticsController.getAnalyticsByDate
);


router.put("/:report_date", 
  authController.authorize([6, 7]),
  analyticsController.updateAnalytics
);


router.delete("/:report_date", 
  authController.authorize([6, 7]),
  analyticsController.deleteAnalytics
);

module.exports = router;
