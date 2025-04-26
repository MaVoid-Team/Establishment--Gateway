const Attachment = require("../models/attachment");
const Ticket = require("../models/ticket");
const path = require("path");
const fs = require("fs");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

// Upload an attachment with enhanced error handling
exports.uploadAttachment = catchAsync(async (req, res, next) => {
  try {
    // The 'tickets' upload middleware has already processed the file
    const ticket_id = req.params.ticket_id;
    const user_id = req.session.user.id; // Assuming authentication middleware sets req.user
    const user_role_id = req.session.user.role;

    // Validate ticket_id
    if (!ticket_id) {
      return next(new AppError("Ticket ID is required.", 400));
    }

    // Fetch the ticket
    const ticket = await Ticket.findByPk(ticket_id);
    if (!ticket) {
      return next(new AppError("Ticket not found.", 404));
    }

    // Prevent adding attachments to closed tickets
    if (ticket.status_id === 4) {
      // Assuming status_id 4 = Closed
      return next(
        new AppError("Cannot add attachments to a closed ticket.", 400)
      );
    }

    if (!req.file) {
      return next(new AppError("No file uploaded.", 400));
    }

    // Create a new attachment record
    const attachment = await Attachment.create({
      ticket_id,
      file_name: req.file.filename,
      file_path: req.file.path, // Relative path from public directory
      uploaded_at: new Date(),
    });

    res.status(201).json({
      attachment_id: attachment.attachment_id,
      ticket_id: attachment.ticket_id,
      file_name: attachment.file_name,
      file_path: attachment.file_path,
      uploaded_at: attachment.uploaded_at,
    });
  } catch (error) {
    console.error("Error uploading attachment:", error);
    next(new AppError("Internal server error.", 500));
  }
});

// Download an attachment with enhanced error handling
exports.downloadAttachment = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.session.user.id;
    const user_role_id = req.session.user.role;

    const attachment = await Attachment.findByPk(id, {
      include: [{ model: Ticket, as: "ticket" }],
    });

    if (!attachment) {
      return next(new AppError("Attachment not found.", 404));
    }

    // Authorization: Only the ticket creator, assignee, or Admin can download
    if (
      attachment.ticket.created_by !== user_id &&
      attachment.ticket.assigned_to !== user_id &&
      user_role_id !== 7
    ) {
      return next(
        new AppError("Unauthorized to download this attachment.", 403)
      );
    }

    const absolutePath = path.resolve(
      __dirname,
      "..",
      "public",
      attachment.file_path
    );

    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      return next(new AppError(`${absolutePath} not found on server.`, 404));
    }

    res.download(absolutePath, attachment.file_name, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        next(new AppError("Error downloading file.", 500));
      }
    });
  } catch (error) {
    console.error("Error downloading attachment:", error);
    next(new AppError("Internal server error.", 500));
  }
});

// Delete an attachment with enhanced error handling
exports.deleteAttachment = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.session.user.id;
    const user_role_id = req.session.user.role;

    const attachment = await Attachment.findByPk(id, {
      include: [{ model: Ticket, as: "ticket" }],
    });

    if (!attachment) {
      return next(new AppError("Attachment not found.", 404));
    }

    // Prevent deleting attachments from closed tickets
    if (attachment.ticket.status_id === 4) {
      // Closed
      return next(
        new AppError("Cannot delete attachments from a closed ticket.", 400)
      );
    }

    // Authorization: Only the ticket assignee or Admin can delete attachments
    if (attachment.ticket.assigned_to !== user_id && user_role_id !== 7) {
      return next(new AppError("Unauthorized to delete this attachment.", 403));
    }

    // Delete the file from the filesystem
    const absolutePath = path.resolve(
      __dirname,
      "..",
      "public",
      attachment.file_path
    );
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    // Delete the attachment record from the database
    await attachment.destroy();

    res.status(200).json({ message: "Attachment deleted successfully." });
  } catch (error) {
    console.error("Error deleting attachment:", error);
    next(new AppError("Internal server error.", 500));
  }
});
