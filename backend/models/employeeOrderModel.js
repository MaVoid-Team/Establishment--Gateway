const Sequelize = require("sequelize");
const db = require("../config/db");

const EmployeeOrder = db.define(
  "employeeOrder",
  {
    status: {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    assigned_at: {
      type: Sequelize.DATE,
      allowNull: false
    },
    decided_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    comment: {
      type: Sequelize.TEXT,
      allowNull: true
    }
  },
  {
    timestamps: false,
    tableName: "employee_orders",
  }
);

module.exports = EmployeeOrder;
