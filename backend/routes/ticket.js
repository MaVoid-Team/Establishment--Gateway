const express = require("express");
const ticketController = require("../controllers/ticketController");
const commentController = require("../controllers/commentController");
const attachmentController = require("../controllers/attachmentController");
const router = express.Router();
const authController = require("../controllers/authController");
const { uploadMiddleware } = require("../utils/Upload");

router.use(authController.requireAuth);

router.get("/getmytickets/:type", ticketController.getMyTickets);

// Ticket CRUD routes
router.post(
  "/",
  authController.authorize([2, 3, 4, 5, 6, 7]),
  ticketController.createTicket
);

router.get(
  "/",
  authController.authorize([3, 4, 5, 6, 7]),
  ticketController.getAllTickets
);
router.get(
  "/:id",
  authController.authorize([2, 3, 4, 5, 6, 7]),
  ticketController.getTicketById
);

router.put(
  "/:id",
  authController.authorize([3, 4, 5, 6, 7]),
  ticketController.updateTicket
);

router.delete(
  "/:id",
  authController.authorize([6, 7]),
  ticketController.deleteTicket
);

router.get("/employee/:employee_id", ticketController.getTicketsByEmployeeId);

router.get(
  "/status/:status_id",
  authController.authorize([3, 4, 5, 6, 7]),
  ticketController.getTicketsByStatus
);

router.get(
  "/category/:category_id",
  authController.authorize([3, 4, 5, 6, 7]),
  ticketController.getTicketsByCategory
);

// Comments routes
router.post(
  "/:ticket_id/comments",
  authController.authorize([2, 3, 4, 5, 6, 7]),
  commentController.addComment
);

router.get(
  "/:ticket_id/comments",
  authController.authorize([3, 4, 5, 6, 7]),
  commentController.getCommentsByTicket
);

router.put(
  "/comments/:id",
  authController.authorize([3, 4, 5, 6, 7]),
  commentController.updateComment
);

router.delete(
  "/comments/:id",
  authController.authorize([6, 7]),
  commentController.deleteComment
);

// Attachments routes

// Upload Attachment for Tickets
router.post(
  "/:ticket_id/attachments",
  authController.authorize([2, 3, 4, 5, 6, 7]),
  uploadMiddleware.tickets, // Use 'tickets' upload type
  attachmentController.uploadAttachment
);

// Download Attachment
router.get(
  "/attachments/:id/download",
  authController.authorize([2, 3, 4, 5, 6, 7]),
  attachmentController.downloadAttachment
);

// Delete Attachment
router.delete(
  "/attachments/:id",
  authController.authorize([6, 7]),
  attachmentController.deleteAttachment
);

module.exports = router;
