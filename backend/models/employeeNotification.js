// models/EmployeeNotification.js
const { DataTypes } = require("sequelize");
const db = require("../config/db");

const EmployeeNotification = db.define(
  "EmployeeNotification",

  {
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "employee",
        key: "id",
        onDelete: "CASCADE",
      },
    },
    notification_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Notification",
        key: "id",
        onDelete: "CASCADE",
      },
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    // timestamps: false, // Optional: disable timestamps if not needed
    tableName: "employee_notifications",
  }
);

module.exports = EmployeeNotification;
