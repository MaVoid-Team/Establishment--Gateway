const Sequelize = require("sequelize");
const db = require("../config/db");

const Role = db.define(
  "role",
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Role name cannot be null",
        },
        notEmpty: {
          msg: "Role name is required",
        },
      },
    },
    permissions: {
      type: Sequelize.JSON,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Permissions cannot be null",
        },
        notEmpty: {
          msg: "Permissions are required",
        },
      },
    },
    approval_limit: {
      // New Field
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0, // Default limit (e.g., 0 means no self-approval)
      validate: {
        isInt: {
          msg: "Approval limit must be an integer",
        },
        min: {
          args: [0],
          msg: "Approval limit cannot be negative",
        },
      },
    },
  },
  {
    timestamps: false,
    tableName: "roles",
  }
);

module.exports = Role;