// server.js
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const Notification = require("./models/notifications");
const { Employee, EmployeeNotification } = require("./models/assosciations");
const app = require("./app");
const http = require("http");
const server = http.createServer(app);
const socketIo = require("socket.io");
const { sessionMiddleware } = require("./config/session"); // Adjust the path as needed
const { setIO } = require("./utils/socket"); // Utility to access Socket.IO instance

// Initialize Socket.IO with CORS settings
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Replace with your frontend URL
    methods: ["GET", "POST"],
    credentials: true, // Allow credentials (cookies) to be sent
  },
});

// Helper function to wrap Express middleware for Socket.IO
const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

// Use the shared session middleware for Socket.IO
io.use(wrap(sessionMiddleware));

// Middleware to authenticate and assign rooms
io.use((socket, next) => {
  const session = socket.request.session;
  if (session && session.user && session.user.role && session.user.department) {
    // Attach user information to the socket object
    socket.user = session.user;
    // Define the role-based room name
    const roleRoom = `role_${session.user.role}`;
    socket.roleRoom = roleRoom;
    // Define the department-based room name
    const depRoom = `dep_${session.user.department}`;
    socket.depRoom = depRoom;

    // Define the personal room name
    const userRoom = `user_${socket.user.id}`;
    socket.userRoom = userRoom;

    // Join both rooms
    if (session.user.orderToggle === true) {
      // console.log("session.user.orderToggle ", session.user.orderToggle);
      socket.join(roleRoom);

      //if the user is manager add him to department room
      if (session.user.role === 3) {
        // console.log("session.user.deaprtment ", session.user.deaprtment);?
        socket.join(depRoom);
      }
    }
    socket.join(userRoom);

    console.log(
      `Socket ${socket.id} joined rooms: ${roleRoom}, ${userRoom}, ${depRoom} (User: ${socket.user.name})`
    );

    next();
  } else {
    console.log(`Unauthorized socket connection: ${socket.id}`);
    next(new Error("Unauthorized"));
  }
});

// Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id, "User:", socket.user?.name);

  // Handle marking notifications as read
  socket.on("mark_notifications_read", async (callback) => {
    try {
      const userId = socket.user.id;

      // Step 1: Fetch unread notifications for the user
      const [updatedCount] = await EmployeeNotification.update(
        { is_read: true }, // Set is_read to true
        {
          where: {
            employee_id: userId,
            is_read: false, // Only update unread notifications
          },
        }
      );

      if (updatedCount === 0) {
        callback({ status: "error", message: "No unread notifications found" });
        return;
      }

      // Step 2: Update the status of the notifications to "read"
      const updatedNotifications = await EmployeeNotification.findAll({
        where: { employee_id: userId },
        include: {
          model: Notification,
          as: "notification",
        },
        order: [["createdAt", "DESC"]],
      });

      // Step 3: Fetch the updated notifications to send back to the user
      const formattedNotifications = updatedNotifications.map((userNotif) => ({
        id: userNotif.notification.id,
        message: userNotif.notification.message,
        created_at: userNotif.notification.createdAt,
        is_read: userNotif.is_read,
      }));

      // Step 4: Emit the updated notifications back to the user
      io.to(`user_${userId}`).emit(
        "notifications_status_changed",
        formattedNotifications
      );

      // Step 5: Callback with success message
      callback({ status: "success", message: "Notifications marked as read" });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      callback({
        status: "error",
        message: "Failed to mark notifications as read",
      });
    }
  });

  // Handle the event to fetch all notifications on page load or reconnect
  socket.on("fetch_notifications", async (data, callback) => {
    try {
      const userId = socket.user.id;
      const { page = 1, limit = 20 } = data; // Default values

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Fetch notifications with pagination
      const { rows: notifications, count } =
        await EmployeeNotification.findAndCountAll({
          where: { employee_id: userId },
          include: {
            model: Notification,
            as: "notification",
          },
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit, 10),
          offset: parseInt(offset, 10),
        });
      // console.log("count", count);
      const formattedNotifications = await notifications.map((userNotif) => ({
        id: userNotif.notification.id,
        message: userNotif.notification.message,
        created_at: userNotif.notification.createdAt,
        is_read: userNotif.is_read,
      }));

      // Calculate total pages
      const totalPages = Math.ceil(count / limit);
      // console.log(formattedNotifications);

      // Send the fetched notifications and total pages back to the client
      callback({
        notifications: formattedNotifications,
        currentPage: page,
        totalPages: totalPages,
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      callback({
        notifications: [],
        currentPage: 1,
        totalPages: 1,
      });
    }
  });

  // Handle disconnections
  socket.on("disconnect", (reason) => {
    console.log("Client disconnected:", socket.id, "Reason:", reason);
  });
});

// Make the Socket.IO instance accessible in your app if needed
app.set("socketio", io);
setIO(io); // Set the Socket.IO instance in the utility

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
