const Comment = require('../models/comment');
const Ticket = require('../models/ticket');
const Employee = require('../models/employeeModel');
const catchAsync = require("../utils/catchAsync");

// Add a comment to a ticket
exports.addComment = catchAsync(async (req, res) => {
  try {
    const { comment } = req.body;
    const user_id = req.session.user.id; // Assuming authentication middleware sets req.user
    const ticket_id = req.params.ticket_id;
    // Check if ticket exists
    const ticket = await Ticket.findByPk(ticket_id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const newComment = await Comment.create({
      ticket_id,
      user_id,
      comment,
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all comments for a ticket
exports.getCommentsByTicket = catchAsync(async (req, res) => {
  try {
    const { ticket_id } = req.params;

    // Check if ticket exists
    const ticket = await Ticket.findByPk(ticket_id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const comments = await Comment.findAll({
      where: { ticket_id },
      include: [{ model: Employee, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['created_at', 'ASC']],
    });

    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a comment
exports.updateComment = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const user_id = req.session.user.id; // Assuming authentication middleware sets req.user

    const existingComment = await Comment.findByPk(id);
    if (!existingComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Optional: Only allow the user who created the comment to update it
    if (existingComment.user_id !== user_id) {
      return res.status(403).json({ message: 'Unauthorized to update this comment' });
    }

    existingComment.comment = comment || existingComment.comment;
    await existingComment.save();

    res.status(200).json(existingComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a comment
exports.deleteComment = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.session.user.id; // Assuming authentication middleware sets req.user

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Optional: Only allow the user who created the comment or admins to delete it
    if (comment.user_id !== user_id && req.session.user.role !== 7) { // Assuming role_id 3 is admin
      return res.status(403).json({ message: 'Unauthorized to delete this comment' });
    }

    await comment.destroy();
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});