const {
  Notification,
  Employee,
  EmployeeNotification,
  notificationPreference,
  notificationType,
  Role,
} = require("../models/assosciations");
const db = require("../config/db");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

// exports.createAndSendNotification =
//   // async (req, res, next) => {
//   // const { userIds, role, message } = req.body;
//   async ({ userIds = [], role = [], message }) => {
//     const transaction = await db.transaction();
//     try {
//       // Create the notification record
//       const notification = await Notification.create(
//         { message },
//         { transaction }
//       );

//       // Handle specific users
//       if (userIds.length > 0) {
//         const userNotifications = userIds.map((userId) => ({
//           employee_id: userId,
//           notification_id: notification.id,
//           is_read: false,
//         }));
//         await EmployeeNotification.bulkCreate(userNotifications, {
//           transaction,
//         });
//       }

//       // Handle role
//       if (role.length > 0) {
//         try {
//           await db.query(
//             `
//             INSERT INTO employee_notifications (employee_id, notification_id, is_read, "createdAt", "updatedAt")
//             SELECT e.id, :notificationId, FALSE, NOW(), NOW()
//             FROM employee e
//             INNER JOIN roles r ON e.role_id = r.id
//             WHERE r.id IN (:role)`,

//             {
//               replacements: { notificationId: notification.id, role },
//               type: db.QueryTypes.INSERT,
//               transaction,
//             }
//           );
//         } catch (error) {
//           console.error("Error executing query: ", error);
//           throw error;
//         }
//       }

//       await transaction.commit();
//       return notification;
//       // console.log("notification", notification);
//       // res.status(201).json({
//       //   status: "success",
//       //   message: "Notification sent successfully",
//       //   data: { notification },
//       // });
//     } catch (error) {
//       await transaction.rollback();
//       throw error;
//     }
//   };

exports.createAndSendNotification = async ({
  userIds = [],
  role = [],
  dep = [],
  message,
  notificationTypeId,
}) => {
  const transaction = await db.transaction();
  try {
    // Create the notification record
    const notification = await Notification.create(
      {
        message,
        notification_type_id: notificationTypeId,
      },
      { transaction }
    );

    // Handle specific users with preference check
    if (userIds.length > 0) {
      // Get users who haven't disabled this notification type
      const enabledUsers = await notificationPreference.findAll({
        where: {
          employee_id: userIds,
          notification_type_id: notificationTypeId,
          is_enabled: true,
        },
        transaction,
      });

      const enabledUserIds = enabledUsers.map((pref) => pref.employee_id);

      if (enabledUserIds.length > 0) {
        const userNotifications = enabledUserIds.map((userId) => ({
          employee_id: userId,
          notification_id: notification.id,
          is_read: false,
        }));
        await EmployeeNotification.bulkCreate(userNotifications, {
          transaction,
        });
      }
    }

    if (role.length > 0 && dep.length === 0) {
      try {
        // Find employees matching the criteria
        const employees = await Employee.findAll({
          where: { role_id: role },
          include: [
            // {
            //   model: Role,
            //   where: { id: role },
            //   // Filter by role IDs
            //   as: "employeeRole",
            //   required: true, // Ensures an inner join
            // },
            {
              model: notificationType, // Include related NotificationType via NotificationPreference
              through: {
                model: notificationPreference, // Join table
                where: {
                  is_enabled: true,
                },
              },
              where: {
                id: notificationTypeId, // Filter by NotificationType ID
              },
              required: true, // Ensures an inner join
            },
          ],
          attributes: ["id"], // Only select the employee IDs
          transaction,
        });

        if (employees.length === 0) {
          console.log("No employees matched the criteria.");
          return; // Exit if no employees are found
        }
        // Map employees to the notification data to be inserted
        const notificationData = employees.map((employee) => ({
          employee_id: employee.id,
          notification_id: notification.id,
          is_read: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        // Bulk insert into employee_notifications
        await EmployeeNotification.bulkCreate(notificationData, {
          transaction,
        });
      } catch (error) {
        console.error("Error executing query: ", error);
        throw error;
      }
    }
    if (dep.length > 0 && role.length > 0) {
      try {
        const employees = await Employee.findAll({
          where: { role_id: role, department_id: dep },
          include: [
            {
              model: notificationType, // Include related NotificationType via NotificationPreference
              through: {
                model: notificationPreference, // Join table
                where: {
                  is_enabled: true,
                },
              },
              where: {
                id: notificationTypeId, // Filter by NotificationType ID
              },
              required: true, // Ensures an inner join
            },
          ],
          attributes: ["id"], // Only select the employee IDs
          transaction,
        });
        console.log(employees);
        if (employees.length === 0) {
          console.log("No employees matched the criteria.");
          return; // Exit if no employees are found
        }
        // Map employees to the notification data to be inserted
        const notificationData = employees.map((employee) => ({
          employee_id: employee.id,
          notification_id: notification.id,
          is_read: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        // Bulk insert into employee_notifications
        await EmployeeNotification.bulkCreate(notificationData, {
          transaction,
        });
      } catch (error) {
        console.error("Error executing query: ", error);
        throw error;
      }
    }

    await transaction.commit();
    return notification;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

exports.createNotificationPreference = async (req, res) => {
  const { employee_id, notification_type_id, is_enabled } = req.body;

  try {
    const preference = await notificationPreference.create({
      employee_id,
      notification_type_id,
      is_enabled,
    });

    res.status(201).json({
      message: "Notification preference created successfully",
      preference,
    });
  } catch (error) {
    console.error("Error creating notification preference:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateNotificationPreferences = catchAsync(async (req, res, next) => {
  const { employeeId, preferences } = req.body;

  // preferences should be an array of { notification_type_id, is_enabled }
  const updates = await Promise.all(
    preferences.map(async (pref) => {
      const [preference] = await notificationPreference.upsert({
        employee_id: employeeId,
        notification_type_id: pref.notification_type_id,
        is_enabled: pref.is_enabled,
      });
      return preference;
    })
  );

  res.status(200).json({
    status: "success",
    message: "Notification preferences updated successfully",
    data: { preferences: updates },
  });
});

exports.getNotificationPreferencesByEmployeeId = catchAsync(
  async (req, res, next) => {
    const { employeeId } = req.params;

    // Fetch notification preferences for the employee
    const preferences = await notificationPreference.findAll({
      where: { employee_id: employeeId },
      include: [
        {
          model: notificationType, // Include associated notification type
          attributes: ["name", "description"], // Select specific attributes
        },
      ],
    });

    // Send the response
    res.status(200).json({
      status: "success",
      data: { preferences },
    });
  }
);

exports.getAllNotificationPreferences = async (req, res) => {
  try {
    const preferences = await notificationPreference.findAll();
    res.status(200).json(preferences);
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteNotificationPreference = async (req, res) => {
  const { employee_id, notification_type_id } = req.params;

  try {
    const rowsDeleted = await notificationPreference.destroy({
      where: { employee_id, notification_type_id },
    });

    if (rowsDeleted === 0) {
      return res
        .status(404)
        .json({ error: "Notification preference not found" });
    }

    res.status(200).json({
      message: "Notification preference deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification preference:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUnreadNotifications = catchAsync(async (employeeId) => {
  return await EmployeeNotification.findAll({
    where: { employee_id: employeeId, is_read: false },
    include: [
      {
        model: Notification,
        as: "Notification",
      },
    ],
    order: [["createdAt", "DESC"]],
  });
});

exports.markAsRead = catchAsync(async (employeeId, notificationIds) => {
  const ids = Array.isArray(notificationIds)
    ? notificationIds
    : [notificationIds];

  const [updatedCount] = await EmployeeNotification.update(
    { is_read: true },
    {
      where: {
        employee_id: employeeId,
        notification_id: ids,
        is_read: false,
      },
    }
  );

  if (updatedCount === 0) {
    return next(new AppError("No notifications found to mark as read", 404));
  }

  return updatedCount;
});

exports.createNotificationType = async (req, res) => {
  const { name, description } = req.body;

  try {
    const type = await notificationType.create({ name, description });

    res.status(201).json({
      message: "Notification type created successfully",
      type,
    });
  } catch (error) {
    console.error("Error creating notification type:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllNotificationTypes = async (req, res) => {
  try {
    const types = await notificationType.findAll();
    res.status(200).json(types);
  } catch (error) {
    console.error("Error fetching notification types:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a specific notification type
exports.getNotificationType = async (req, res) => {
  const { id } = req.params;

  try {
    const type = await notificationType.findByPk(id);

    if (!type) {
      return res.status(404).json({ error: "Notification type not found" });
    }

    res.status(200).json(type);
  } catch (error) {
    console.error("Error fetching notification type:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a notification type
exports.updateNotificationType = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const type = await notificationType.findByPk(id);

    if (!type) {
      return res.status(404).json({ error: "Notification type not found" });
    }

    type.name = name || type.name;
    type.description = description || type.description;
    await type.save();

    res.status(200).json({
      message: "Notification type updated successfully",
      type,
    });
  } catch (error) {
    console.error("Error updating notification type:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a notification type
exports.deleteNotificationType = async (req, res) => {
  const { id } = req.params;

  try {
    const rowsDeleted = await notificationType.destroy({
      where: { id },
    });

    if (rowsDeleted === 0) {
      return res.status(404).json({ error: "Notification type not found" });
    }

    res.status(200).json({
      message: "Notification type deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification type:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
