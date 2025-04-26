// controllers/orderController.js

const {
  Employee,
  Role,
  Order,
  EmployeeOrder,
} = require("../models/assosciations");
const Signature = require("../models/signatures");
const notificationController = require("./notificationsController");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { Sequelize } = require("sequelize");
const validator = require("validator");
const db = require("../config/db");
const OrderLog = require("../models/orderLogModel");
const { getIO } = require("../utils/socket");
const sendMail = require("../utils/email");
const approvalEmail = require("../emailTemplates/approvalEmail");
const approvalEmail2 = require("../emailTemplates/approvalEmail2");
const rejectionEmail = require("../emailTemplates/rejectionEmail");
// ─────────────────────────────────────────────────────────────────────────────
// Helper function: get submitter info from session
// ─────────────────────────────────────────────────────────────────────────────
const getSubmitterAndRole = (req) => {
  const submitter_id = req.session.user.id; // Get the employee ID from the session
  const role = req.session.user.role || "Unknown"; // Get the role from the session or default to "Unknown"
  return { submitter_id, role };
};

// ─────────────────────────────────────────────────────────────────────────────
// Controller for creating an order
// ─────────────────────────────────────────────────────────────────────────────
exports.createOrder = catchAsync(async (req, res, next) => {
  const {
    company_id,
    price,
    estimated_time,
    title,
    description,
    notes,
    payment_method,
    delivery_status,
  } = req.body;

  const employee_id = req.session.user.id;
  const department = req.session.user.department;
  // Input validation
  if (
    !company_id ||
    !employee_id ||
    !price ||
    !title ||
    !description ||
    !estimated_time ||
    !payment_method ||
    !delivery_status ||
    !validator.isNumeric(price.toString())
  ) {
    return next(new AppError("Invalid input data (fields can't be null)", 400));
  }

  // Start transaction
  const transaction = await db.transaction();

  try {
    // Prepare attachments
    let attachment = null;
    if (req.files && req.files.length > 0) {
      attachment = req.files.map((file) => ({
        path: file.path,
        url: file.url,
      }));
    } else if (req.file) {
      // Fallback for single file upload (legacy support)
      attachment = [{ path: req.file.path, url: req.file.url }];
    }

    // Create the new order
    const order = await Order.create(
      {
        company_id,
        employee_id,
        price,
        title,
        description,
        notes,
        attachment,
        // attachment: req.file
        //   ? { path: req.file.path, url: req.file.url }
        //   : null,
        estimated_time: new Date(estimated_time),
        payment_method,
        delivery_status,
        created_at: new Date(),
        final_status: "pending",
      },
      { transaction }
    );

    // Initiate the new approval process
    await initiateApprovalProcess(order, transaction);

    await EmployeeOrder.create(
      {
        employee_id: employee_id,
        order_id: order.id,
        status: "approved",
        assigned_at: new Date(),
        decided_at: new Date(),
      },
      { transaction }
    );

    // Commit transaction
    await transaction.commit();

    const orderData = order.dataValues;
    // console.log(orderData);
    // No "current_approver_role_id" => means it was self-approved or no manager needed
    if (!orderData.current_approver_role_id) {
      // Notification: self-approved or final approved
      const notification =
        await notificationController.createAndSendNotification({
          userIds: [orderData.employee_id],
          message: `Your order "${orderData.title}" has been approved.`,
          notificationTypeId: 1,
        });
      if (notification) {
        const io = getIO();
        io.to(`user_${orderData.employee_id}`).emit("notification", {
          id: notification.id,
          message: notification.message,
          created_at: notification.createdAt,
          is_read: false,
        });
      }

      // Notification to direct managers or monetary department (depending on stage)
    } else if (orderData.current_approver_role_id === 3) {
      // Notification to direct managers or monetary department (depending on stage)

      const notification =
        await notificationController.createAndSendNotification({
          role: [orderData.current_approver_role_id],
          dep: [department],
          message: `A new order "${order.title}" requires your approval.`,
          notificationTypeId: 1,
        });
      const io = getIO();
      if (notification) {
        io.to(`dep_${department}`).emit("notification", {
          id: notification.id,
          message: notification.message,
          created_at: notification.createdAt,
          is_read: false,
        });
      }
    } else {
      //if the current role >3 then send notification to the monetary
      const notification =
        await notificationController.createAndSendNotification({
          role: [orderData.current_approver_role_id],
          message: `A new order "${order.title}" requires your approval.`,
          notificationTypeId: 1,
        });
      console.log(notification);
      const io = getIO();
      if (notification) {
        io.to(`role_${orderData.current_approver_role_id}`).emit(
          "notification",
          {
            id: notification.id,
            message: notification.message,
            created_at: notification.createdAt,
            is_read: false,
          }
        );
      }
    }

    // Log creation
    const { submitter_id, role } = getSubmitterAndRole(req);
    await OrderLog.create({
      order_id: order.id,
      submitter_id,
      role,
      operation_type: "CREATE",
      new_data: order,
    });

    res.status(201).json({
      status: "success",
      data: { order },
    });
  } catch (error) {
    console.log(error);
    await transaction.rollback();
    return next(new AppError(error.message, 500));
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Controller for getting all orders
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.findAll({
    include: [
      {
        model: Signature,
        as: "signatures",
        required: false,
      },
    ],
  });
  res.status(200).json({
    status: "success",
    results: orders.length,
    data: {
      orders,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Controller for updating an order
// ─────────────────────────────────────────────────────────────────────────────
exports.updateOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findByPk(req.params.orderId);
  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  let attachment;
  if (req.files && req.files.length > 0) {
    attachment = req.files.map((file) => ({
      path: file.path,
      url: file.url,
    }));
  } else if (req.file) {
    // Fallback for single file upload (legacy support)
    attachment = [{ path: req.file.path, url: req.file.url }];
  }
  // console.log(attachment);
  // old data
  const oldData = { ...order.get({ plain: true }) };

  // update
  await order.update(attachment ? { ...req.body, attachment } : req.body);

  // new data
  const newData = { ...order.get({ plain: true }) };

  const submitter_id = req.session.user.id;
  const role = req.session.user.role || "Unknown";

  await OrderLog.create({
    order_id: order.id,
    submitter_id,
    role,
    operation_type: "UPDATE",
    old_data: oldData,
    new_data: newData,
  });

  res.status(200).json({
    status: "success",
    data: {
      order,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Controller for deleting an order
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findByPk(req.params.orderId);
  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  const oldData = { ...order.get({ plain: true }) };
  const submitter_id = req.session.user.id;
  const role = req.session.user.role || "Unknown";

  await OrderLog.create({
    order_id: order.id,
    submitter_id,
    role,
    operation_type: "DELETE",
    old_data: oldData,
  });

  await order.destroy();

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NEW: Initiate the approval process for a new order
//
// SCENARIO:
//   1) If the order is within the role’s approval_limit => self-approve.
//   2) Else => assign to all "direct managers" in the employee’s department.
// ─────────────────────────────────────────────────────────────────────────────
const initiateApprovalProcess = async (order, transaction) => {
  // Get the ordering employee, including department and role
  const orderingEmployee = await Employee.findByPk(order.employee_id, {
    include: [{ model: Role, as: "employeeRole" }],
    transaction,
  });

  if (!orderingEmployee || !orderingEmployee.employeeRole) {
    throw new AppError("Employee or role not found", 404);
  }

  // Fetch approval_limit from the employee's role
  const employeeRole = orderingEmployee.employeeRole;
  const roleApprovalLimit = employeeRole.approval_limit || 0;

  const directManagerRole = await Role.findOne({
    where: { name: "direct manager" },
    transaction,
  });

  const managers = await Employee.findAll({
    where: {
      department_id: orderingEmployee.department_id,
      role_id: directManagerRole.id,
    },
  });
  console.log("managers", managers);
  let managerApproval = managers.map((manager) => {
    return {
      employee_id: manager.id,
      role_id: manager.role_id,
      status: "approved",
      timestamp: new Date(),
      comment: " Default approval by manager",
    };
  });
  console.log("managerApproval", managerApproval);
  // If order does NOT exceed the role's approval limit => self-approve
  if (order.price <= roleApprovalLimit) {
    await order.update(
      {
        final_status: "approved",
        approval_chain: [
          {
            employee_id: orderingEmployee.id,
            role_id: employeeRole.id,
            status: "approved",
            timestamp: new Date(),
            comment: "Self-approved based on role's approval limit",
          },
          ...managerApproval,
        ],
      },
      { transaction }
    );

    return;
  }

  // If order exceeds the approval limit and the role is a manager => send to monetary department

  const monetaryRole = await Role.findOne({
    where: { name: "monetary" },
    transaction,
  });

  if (!directManagerRole || !monetaryRole) {
    throw new AppError(
      "Required roles (direct manager/monetary) not found",
      404
    );
  }

  if (employeeRole.id === directManagerRole.id) {
    // Assign to monetary department
    const monetaryDeptEmployees = await Employee.findAll({
      where: {
        role_id: monetaryRole.id,
      },
      transaction,
    });

    if (!monetaryDeptEmployees || monetaryDeptEmployees.length === 0) {
      throw new AppError("No employees found for Monetary role", 404);
    }

    // Create EmployeeOrder entries for the monetary department
    await Promise.all(
      monetaryDeptEmployees.map((monetaryEmp) =>
        EmployeeOrder.create(
          {
            employee_id: monetaryEmp.id,
            order_id: order.id,
            status: "pending",
            assigned_at: new Date(),
          },
          { transaction }
        )
      )
    );

    // Update the order to reflect the next approver role
    await order.update(
      {
        current_approver_role_id: monetaryRole.id,
        approval_chain: [
          {
            employee_id: orderingEmployee.id,
            role_id: orderingEmployee.employeeRole.id,
            status: "forwarded",
            timestamp: new Date(),
            comment: "Order sent to monetary department for approval.",
          },
        ],
      },
      { transaction }
    );
    return;
  }

  // If order exceeds the approval limit => send to "direct managers"
  // Fetch all direct managers in the same department
  const departmentManagers = await Employee.findAll({
    where: {
      department_id: orderingEmployee.department_id,
      role_id: directManagerRole.id,
    },
    transaction,
  });

  if (!departmentManagers || departmentManagers.length === 0) {
    throw new AppError("No direct managers found in this department", 403);
  }

  // Create EmployeeOrder entries for the managers and send emails
  await Promise.all(
    departmentManagers.map(async (mgr) => {
      // Create EmployeeOrder entry
      await EmployeeOrder.create(
        {
          employee_id: mgr.id,
          order_id: order.id,
          status: "pending",
          assigned_at: new Date(),
        },
        { transaction }
      );

      // Send email notification
      await sendMail({
        email: mgr.email,
        subject: "Order Awaiting your approval",
        html: approvalEmail(mgr.name, order.title),
      });
    })
  );

  // Update the order with the current approver role
  await order.update(
    {
      current_approver_role_id: directManagerRole.id,
      approval_chain: [
        {
          employee_id: orderingEmployee.id,
          role_id: orderingEmployee.employeeRole.id,
          status: "forwarded",
          timestamp: new Date(),
          comment: "Order sent to direct managers for approval.",
        },
      ],
    },
    { transaction }
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Controller for handling decisions (approve/reject)
// Refactored logic:
//   1) If a "direct manager" approves => forward to "monetary" department.
//      - Upon first approval, skip other managers.
//   2) If "monetary" approves => finalize the order.
//   3) If any approver rejects => final reject.
// ─────────────────────────────────────────────────────────────────────────────
exports.handleRoleDecision = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { decision, comment } = req.body;
  const employee_id = req.session.user.id;
  const employee_name = req.session.user.name;

  const transaction = await db.transaction();

  try {
    const employee = await Employee.findByPk(employee_id, {
      include: [{ model: Role, as: "employeeRole" }],
      transaction,
    });

    const order = await Order.findByPk(orderId, { transaction });

    if (!order || !employee || !employee.employeeRole) {
      throw new AppError("Order or employee role not found", 404);
    }

    if (order.current_approver_role_id !== employee.role_id) {
      throw new AppError("Not authorized to make this decision", 403);
    }

    await EmployeeOrder.update(
      {
        status: decision,
        decided_at: new Date(),
        comment: comment,
      },
      {
        where: {
          employee_id,
          order_id: orderId,
        },
        transaction,
      }
    );

    const orderingEmployee = await Employee.findByPk(order.employee_id, {
      transaction,
    });

    const approvalChain = [
      ...(order.approval_chain || []),
      {
        employee_id: employee.id,
        role_id: employee.role_id,
        status: decision,
        timestamp: new Date(),
        comment,
      },
    ];

    const io = getIO();

    if (decision === "approved") {
      const directManagerRole = await Role.findOne({
        where: { name: "direct manager" },
        transaction,
      });
      const monetaryRole = await Role.findOne({
        where: { name: "monetary" },
        transaction,
      });
      // Instead of final approval, forward to CEO for final approval
      const ceoRole = await Role.findOne({
        where: { name: "ceo" },
        transaction,
      });
      if (!ceoRole) {
        throw new AppError("CEO role not found in the system", 404);
      }
      if (!directManagerRole || !monetaryRole) {
        throw new AppError(
          "Required roles (direct manager/monetary) not found in the system",
          404
        );
      }

      // If the approver is a "direct manager"
      if (employee.role_id === directManagerRole.id) {
        // Since only one manager's approval is needed, proceed to monetary
        // Remove other pending EmployeeOrder entries for managers
        await EmployeeOrder.update(
          {
            status: "rejected",
            decided_at: new Date(),
            comment: "rejected due to another manager's approval.",
          },
          {
            where: {
              order_id: orderId,
              employee_id: {
                [Sequelize.Op.ne]: employee_id,
              },
              status: "pending",
            },
            transaction,
          }
        );

        // Assign to monetary department
        const monetaryDeptEmployees = await Employee.findAll({
          where: {
            role_id: monetaryRole.id,
          },
          transaction,
        });

        if (!monetaryDeptEmployees || monetaryDeptEmployees.length === 0) {
          throw new AppError("No employees found for Monetary role", 404);
        }

        // Create EmployeeOrder entries for the monetary department

        await Promise.all(
          monetaryDeptEmployees.map(async (monetaryEmp) => {
            // Create EmployeeOrder entry
            await EmployeeOrder.create(
              {
                employee_id: monetaryEmp.id,
                order_id: order.id,
                status: "pending",
                assigned_at: new Date(),
              },
              { transaction }
            );

            // Send email notification
            await sendMail({
              email: monetaryEmp.email,
              subject: "Order Awaiting your approval",
              html: approvalEmail(monetaryEmp.name, order.title),
            });
          })
        );

        // Update the order to reflect the next approver role
        await order.update(
          {
            current_approver_role_id: monetaryRole.id,
            approval_chain: approvalChain,
          },
          { transaction }
        );

        // Notify the monetary department
        const notification =
          await notificationController.createAndSendNotification({
            role: [monetaryRole.id],
            message: `Order "${order.title}" is ready for your approval (Monetary Dept).`,
            notificationTypeId: 1,
          });
        if (notification) {
          io.to(`role_${monetaryRole.id}`).emit("notification", {
            id: notification.id,
            message: notification.message,
            created_at: notification.createdAt,
            is_read: false,
          });
        }
        // Notify the employee that his order is approved by the direct manager
        // Notify the ordering employee
        const notification2 =
          await notificationController.createAndSendNotification({
            userIds: [orderingEmployee.id],
            message: `Your order "${order.title}" has been approved by the Monetary department.`,
            notificationTypeId: 1,
          });
        if (notification2) {
          io.to(`user_${orderingEmployee.id}`).emit("notification", {
            id: notification2.id,
            message: notification2.message,
            is_read: false,
            created_at: notification2.createdAt,
          });
        }
      } else if (employee.role_id === monetaryRole.id) {
        // Since only one monetary's approval is needed, proceed to monetary
        // Remove other pending EmployeeOrder entries for managers
        await EmployeeOrder.update(
          {
            status: "rejected",
            decided_at: new Date(),
            comment: "rejected due to another manager's approval.",
          },
          {
            where: {
              order_id: orderId,
              employee_id: {
                [Sequelize.Op.ne]: employee_id,
              },
              status: "pending",
            },
            transaction,
          }
        );

        // Assign to CEO
        const ceos = await Employee.findAll({
          where: { role_id: ceoRole.id },
          transaction,
        });
        if (!ceos || ceos.length === 0) {
          throw new AppError("No employees found for CEO role", 404);
        }
        // Create EmployeeOrder entries for all CEOs
        await Promise.all(
          ceos.map(async (ceo) => {
            await EmployeeOrder.create(
              {
                employee_id: ceo.id,
                order_id: order.id,
                status: "pending",
                assigned_at: new Date(),
              },
              { transaction }
            );
            // Send email notification
            await sendMail({
              email: ceo.email,
              subject: "Order Awaiting your approval (CEO)",
              html: approvalEmail(ceo.name, order.title),
            });
          })
        );
        // Update the order to reflect the next approver role (CEO)
        await order.update(
          {
            current_approver_role_id: ceoRole.id,
            approval_chain: approvalChain,
          },
          { transaction }
        );
        // Notify the CEO(s)
        const notification =
          await notificationController.createAndSendNotification({
            role: [ceoRole.id],
            message: `Order "${order.title}" is ready for your approval (CEO).`,
            notificationTypeId: 1,
          });
        if (notification) {
          io.to(`role_${ceoRole.id}`).emit("notification", {
            id: notification.id,
            message: notification.message,
            created_at: notification.createdAt,
            is_read: false,
          });
        }
      } else if (employee.role_id === ceoRole?.id) {
        await EmployeeOrder.update(
          {
            status: "rejected",
            decided_at: new Date(),
            comment: "rejected due to another ceo's approval.",
          },
          {
            where: {
              order_id: orderId,
              employee_id: {
                [Sequelize.Op.ne]: employee_id,
              },
              status: "pending",
            },
            transaction,
          }
        );

        // Final approval by CEO
        await order.update(
          {
            final_status: "approved",
            approval_chain: approvalChain,
            current_approver_role_id: null,
          },
          { transaction }
        );
        await sendMail({
          email: "Ziad.Ahmed.25.25.25@gmail.com",
          subject: "Order Approved",
          html: approvalEmail2("Alaa", order.title),
        });
        await sendMail({
          email: orderingEmployee.email,
          subject: "Order Approved",
          html: approvalEmail2(orderingEmployee.name, order.title),
        });
        // Notify the ordering employee
        const notification =
          await notificationController.createAndSendNotification({
            userIds: [orderingEmployee.id],
            message: `Your order \"${order.title}\" has been approved by the CEO.`,
            notificationTypeId: 1,
          });
        if (notification) {
          io.to(`user_${orderingEmployee.id}`).emit("notification", {
            id: notification.id,
            message: notification.message,
            is_read: false,
            created_at: notification.createdAt,
          });
        }
      }
    } else if (decision === "rejected") {
      // Once ANY approver rejects => final reject
      await order.update(
        {
          final_status: "rejected",
          approval_chain: approvalChain,
          current_approver_role_id: null,
        },
        { transaction }
      );

      await sendMail({
        email: orderingEmployee.email,
        subject: "Order Rejected",
        html: rejectionEmail(orderingEmployee.name, order.title),
      });

      // Notify the ordering employee
      const notification =
        await notificationController.createAndSendNotification({
          userIds: [orderingEmployee.id],
          message: `Your order "${order.title}" has been rejected.`,
          notificationTypeId: 1,
        });
      if (notification) {
        io.to(`user_${orderingEmployee.id}`).emit("notification", {
          id: notification.id,
          message: notification.message,
          created_at: notification.createdAt,
          is_read: false,
        });
      }

      // Optionally, mark all other pending EmployeeOrder entries as rejected
      await EmployeeOrder.update(
        {
          status: "rejected",
          decided_at: new Date(),
          comment: "rejected by higher role employee.",
        },
        {
          where: {
            order_id: orderId,
            status: "pending",
          },
          transaction,
        }
      );
    }

    // Commit transaction
    await transaction.commit();

    res.status(200).json({
      status: "success",
      data: { order },
    });
  } catch (error) {
    await transaction.rollback();
    return next(new AppError(error.message, 500));
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Controller for updating delivery date
// ─────────────────────────────────────────────────────────────────────────────
exports.updateDeliveryDate = catchAsync(async (req, res, next) => {
  const orderID = req.params.orderID;
  const order = await Order.findByPk(orderID);

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  await order.update({
    delivery_date: new Date(Date.now()),
  });

  res.status(200).json({
    status: "success",
    message: "Delivery date updated successfully",
    data: {
      order,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Controller for getting an order by ID
// ─────────────────────────────────────────────────────────────────────────────
exports.getOrderByID = catchAsync(async (req, res, next) => {
  const order = await Order.findByPk(req.params.orderId, {
    include: [
      {
        model: Signature,
        as: "signatures",
        required: false,
      },
    ],
  });
  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      order,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Controller for finding orders by role
// ─────────────────────────────────────────────────────────────────────────────
exports.findOrdersByRole = catchAsync(async (req, res, next) => {
  const userRole = req.session?.user?.role;
  if (!userRole) {
    return next(new AppError("User role not found in session", 401));
  }

  const orders = await Order.findAll({
    where: {
      current_approver_role_id: userRole,
    },
  });

  if (orders.length === 0) {
    return res.status(200).json({
      status: "success",
      message: "No orders found for your role",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      orders,
    },
  });
});
