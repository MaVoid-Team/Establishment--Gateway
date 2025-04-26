const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const notificationPreference = sequelize.define(
  "notificationPreference",
  {
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "employee",
        key: "id",
      },
      primaryKey: true,
    },
    notification_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "notification_types",
        key: "id",
      },
      primaryKey: true,
    },
    is_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    }
  },
  {
    tableName: "notification_preferences",
  }
);

module.exports = notificationPreference;
