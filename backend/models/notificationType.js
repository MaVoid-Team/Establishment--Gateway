const { DataTypes } = require("sequelize");
const db = require("../config/db");

const notificationType = db.define(
  "notificationType",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  },
  {
    tableName: "notification_types",
  }
);

module.exports = notificationType;