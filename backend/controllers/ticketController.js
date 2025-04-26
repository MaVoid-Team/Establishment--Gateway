const Employee = require("../models/employeeModel");
const Ticket = require("../models/ticket");
const Status = require("../models/status");
const Priority = require("../models/priority");
const Category = require("../models/category");
const Comment = require("../models/comment");
const Attachment = require("../models/attachment");
const TicketAudit = require("../models/ticketAudit");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");


// Create a new ticket
exports.createTicket = catchAsync(async (req, res) => {
  try {
    const {
      title,
      description,
      priority_id,
      category_id,
      status_id = 1,
      assigned_to
    } = req.body;
    const created_by = req.session.user.id; // Assuming authentication middleware sets req.user
    console.log(created_by);
    const ticket = await Ticket.create({
      title,
      description,
      created_by,
      priority_id,
      category_id,
      status_id,
      assigned_to
    });

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
});

// Get all tickets
exports.getAllTickets = catchAsync(async (req, res) => {
  try {
    const { category } = req.query;
    
    const queryOptions = {
      include: [
        { 
          model: Employee, 
          as: "creator", 
          attributes: ["id", "name", "email"] 
        },
        {
          model: Employee,
          as: "assignee",
          attributes: ["id", "name", "email"],
        },
        { 
          model: Status, 
          as: "status"
        },
        { 
          model: Priority, 
          as: "priority"
        },
        { 
          model: Category, 
          as: "category"
        },
        {
          model: Comment,
          as: "comments",
          include: [
            {
              model: Employee,
              as: "user",
              attributes: ["id", "name", "email"],
            },
          ],
        },
        { 
          model: Attachment, 
          as: "attachments" 
        },
      ]
    };

    // Add where clause if category is provided
    if (category) {
      queryOptions.where = {
        category_id: category
      };
    }

    const tickets = await Ticket.findAll(queryOptions);

    res.status(200).json({
      status: "success",
      results: tickets.length,
      data: { tickets }
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get a single ticket by ID
exports.getTicketById = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByPk(id, {
      include: [
        { model: Employee, as: "creator", attributes: ["id", "name", "email"] },
        {
          model: Employee,
          as: "assignee",
          attributes: ["id", "name", "email"],
        },
        { model: Status, as: "status" },
        { model: Priority, as: "priority" },
        { model: Category, as: "category" },
        {
          model: Comment,
          as: "comments",
          include: [
            {
              model: Employee,
              as: "user",
              attributes: ["id", "name", "email"],
            },
          ],
        },
        { model: Attachment, as: "attachments" },
      ],
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update a ticket
exports.updateTicket = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      priority_id,
      category_id,
      status_id,
      assigned_to,
    } = req.body;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Store old values for auditing
    const oldStatusId = ticket.status_id;
    const oldPriorityId = ticket.priority_id;
    const oldCategoryId = ticket.category_id;

    // Update ticket fields
    ticket.title = title || ticket.title;
    ticket.description = description || ticket.description;
    ticket.priority_id = priority_id || ticket.priority_id;
    ticket.category_id = category_id || ticket.category_id;
    ticket.status_id = status_id || ticket.status_id;
    ticket.assigned_to = assigned_to || ticket.assigned_to;
    await ticket.save();

    // Create audit record if status, priority, or category changed
    if (
      oldStatusId !== ticket.status_id ||
      oldPriorityId !== ticket.priority_id ||
      oldCategoryId !== ticket.category_id
    ) {
      await TicketAudit.create({
        ticket_id: ticket.ticket_id,
        changed_by: req.session.user.id, // Assuming authentication middleware sets req.user
        old_status_id: oldStatusId,
        new_status_id: ticket.status_id,
        old_priority_id: oldPriorityId,
        new_priority_id: ticket.priority_id,
        old_category_id: oldCategoryId,
        new_category_id: ticket.category_id,
      });
    }

    res.status(200).json(ticket);
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a ticket
exports.deleteTicket = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    await ticket.destroy();
    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

exports.getTicketsByEmployeeId = async (req, res, next) => {
  try {
    const { employee_id } = req.params;

    // Validate employee_id
    if (!employee_id) {
      return next(new AppError("Employee ID is required.", 400));
    }

    // Check if the employee exists
    const employee = await Employee.findByPk(employee_id);
    if (!employee) {
      return next(new AppError("Employee not found.", 404));
    }

    // Fetch tickets where the employee is either the creator or the assignee
    const tickets = await Ticket.findAll({
      where: { created_by: employee_id },
      include: [
        { model: Employee, as: "creator", attributes: ["id", "name", "email"] },
        {
          model: Employee,
          as: "assignee",
          attributes: ["id", "name", "email"],
        },
        { model: Status, as: "status" },
        { model: Priority, as: "priority" },
        { model: Category, as: "category" },
        {
          model: Comment,
          as: "comments",
          include: [
            {
              model: Employee,
              as: "user",
              attributes: ["id", "name", "email"],
            },
          ],
        },
        { model: Attachment, as: "attachments" },
      ],
    });

    res.status(200).json({
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Error fetching tickets by employee ID:", error);
    next(new AppError("Internal server error.", 500));
  }
};

exports.getMyTickets = catchAsync(async (req, res, next) => {
  try {
    const { type } = req.params;

    // Validate type matches category IDs (1 or 2)
    if (!type || !['1', '2'].includes(type)) {
      return next(new AppError("Valid category type (1 or 2) is required.", 400));
    }

    const tickets = await Ticket.findAll({
      where: { 
        category_id: type,
        created_by: req.session.user.id
      },
      include: [
        {
          model: Employee,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
        {
          model: Employee,
          as: "assignee",
          attributes: ["id", "name", "email"],
        },
        { model: Status, as: "status" },
        { model: Priority, as: "priority" },
        { model: Category, as: "category" },
        {
          model: Comment,
          as: "comments",
          include: [
            { model: Employee, as: "user", attributes: ["id", "name", "email"] },
          ],
        },
        { model: Attachment, as: "attachments" },
      ],
    });

    res.status(200).json({
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    next(new AppError("Internal server error.", 500));
  }
});

exports.getTicketsByCategory = catchAsync(async (req, res, next) => {
  try {
    const { category_id } = req.params;

    if (!category_id) {
      return next(new AppError("Category ID is required.", 400));
    }

    // Check if the category exists
    const category = await Category.findByPk(category_id);
    if (!category) {
      return next(new AppError("Category not found.", 404));
    }

    const tickets = await Ticket.findAll({
      where: { category_id },
      include: [
        { model: Employee, as: "creator", attributes: ["id", "name", "email"] },
        { model: Employee, as: "assignee", attributes: ["id", "name", "email"] },
        { model: Status, as: "status" },
        { model: Priority, as: "priority" },
        { model: Category, as: "category" },
        {
          model: Comment,
          as: "comments",
          include: [
            { model: Employee, as: "user", attributes: ["id", "name", "email"] },
          ],
        },
        { model: Attachment, as: "attachments" },
      ],
    });

    res.status(200).json({
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Error fetching tickets by category:", error);
    next(new AppError("Internal server error.", 500));
  }
});

exports.getTicketsByStatus = catchAsync(async (req, res, next) => {
  try {
    const { status_id } = req.params;

    if (!status_id) {
      return next(new AppError("Status ID is required.", 400));
    }

    // Check if the status exists
    const status = await Status.findByPk(status_id);
    if (!status) {
      return next(new AppError("Status not found.", 404));
    }

    const tickets = await Ticket.findAll({
      where: { status_id },
      include: [
        { model: Employee, as: "creator", attributes: ["id", "name", "email"] },
        { model: Employee, as: "assignee", attributes: ["id", "name", "email"] },
        { model: Status, as: "status" },
        { model: Priority, as: "priority" },
        { model: Category, as: "category" },
        {
          model: Comment,
          as: "comments",
          include: [
            { model: Employee, as: "user", attributes: ["id", "name", "email"] },
          ],
        },
        { model: Attachment, as: "attachments" },
      ],
    });

    res.status(200).json({
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Error fetching tickets by status:", error);
    next(new AppError("Internal server error.", 500));
  }
});