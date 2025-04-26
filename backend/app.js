const express = require("express");
const morgan = require("morgan");
const AppError = require("./utils/AppError");
const globalErrorHandler = require("./controllers/errorController");
const companyRouter = require("./routes/company");
const employeeRouter = require("./routes/employee");
const authRouter = require("./routes/auth");
const roleRouter = require("./routes/role");
const orderRouter = require("./routes/order");
const documentRouter = require("./routes/document");
const notificationRoutes = require("./routes/notification");
const departmentRouter = require("./routes/department");
const departmentDocumentRouter = require("./routes/departmentDocument");
const analyticsRouter = require("./routes/analytics");
const vendorRouter = require("./routes/vendor");
const ticketRouter = require("./routes/ticket");
const signatureRouter = require("./routes/signature");
const companyRevenueRoutes = require("./routes/companyRevenueRoute");
const vendorRevenueRoutes = require("./routes/vendorRevenueRoute");
const auditLogRouter = require("./routes/auditlog");
const salesContractRoutes = require("./routes/salesContracts");
const commentRouter = require("./routes/comment");
const notificationTypeRouter = require("./routes/notificationType");
const notificationPrefRouter = require("./routes/notificationPerf");
const { sessionMiddleware } = require("./config/session");
const app = express();
app.use(express.json());
app.use(morgan("dev"));

const corsMiddleware = (req, res, next) => {
  const allowedOrigins = [
    "https://liwandevelopment.mavoid.com", 
    "http://localhost:5173",
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
};

app.use(corsMiddleware);
app.use(sessionMiddleware);

app.use("/signatures", express.static("public/signatures"));

app.use("/uploads", express.static("public/uploads"));

app.use("/api/v1/companies", companyRouter);
app.use("/api/v1/employees", employeeRouter);
app.use("/api/v1/roles", roleRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/documents", documentRouter);
app.use("/api/v1/departments", departmentRouter);
app.use("/api/v1/depstodocs", departmentDocumentRouter);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/vendors", vendorRouter);
app.use("/api/v1/signatures", signatureRouter);
app.use("/api/v1/tickets", ticketRouter);
app.use("/api/v1/analytics", analyticsRouter);
app.use("/api/v1/companyRevenue", companyRevenueRoutes);
app.use("/api/v1/vendorRevenue", vendorRevenueRoutes);
app.use("/api/v1/audit-logs", auditLogRouter);
app.use("/api/v1/sales-contracts", salesContractRoutes);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/notificationType", notificationTypeRouter);
app.use("/api/v1/notificationPref", notificationPrefRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
