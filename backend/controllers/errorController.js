const AppError = require("../utils/AppError");
const { logger } = require("../utils/logger");

const handleSequelizeValidationError = (err) => {
  const errors = err.errors.map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleSequelizeUniqueConstraintError = (err) => {
  const fields = Object.keys(err.fields);
  const message = `Duplicate value for field(s): ${fields.join(", ")}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {
  //A)API
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  logger.error(err);
  return res.status(err.statusCode).json({
    status: "Failed",
    msg: "something went wrong",
  });
};

const sendErrorProd = (err, req, res) => {
  //A) Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: "error",
      message: "Something went very wrong!",
    });
  } else {
    res.status(500).json({
      status: "Error",
      message: "Something went wrong!",
    });
  }
  logger.error(err);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = { ...err };
  error.message = err.message; // Copy the message explicitly
  error.name = err.name; // Copy the name explicitly
  error.status = err.status;
  error.stack = err.stack; // Preserve the stack trace if needed

  if (err.name === "SequelizeValidationError") {
    error = handleSequelizeValidationError(err);
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    error = handleSequelizeUniqueConstraintError(err);
  }

  logger.error(err);
  sendErrorDev(error, req, res);
};
