const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notification_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "notification_types",
        key: "id",
      }
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "orders", key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    
    status: {
      type: DataTypes.ENUM("unread", "read"),
      defaultValue: "unread",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "notifications", // Optional: Specify table name if different
  }
);

// Notification.sync({ alter: true });

module.exports = Notification;
