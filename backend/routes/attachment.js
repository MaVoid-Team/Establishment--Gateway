const express = require("express");
const attachmentController = require("../controllers/attachmentController");
const router = express.Router();
const authController = require("../controllers/authController");

router.use(authController.requireAuth);

router.post(
  "/:ticket_id/attachments",
  upload.single("file"),
  authController.authorize([2,3,4,5, 6, 7]),
  attachmentController.uploadAttachment
);
router.get(
  "/attachments/:id/download",
  authController.authorize([2,3,4,5, 6, 7]),
  attachmentController.downloadAttachment
);
router.delete("/attachments/:id", 
  authController.authorize([2,3,4,5, 6, 7]),
  attachmentController.deleteAttachment
);

module.exports = router;