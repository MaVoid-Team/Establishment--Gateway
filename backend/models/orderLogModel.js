const Sequelize = require("sequelize");
const db = require("../config/db");

const OrderLog = db.define("order_logs", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  operation_type: {
    type: Sequelize.STRING(10),
    allowNull: false,
    validate: {
      isIn: {
        args: [["CREATE", "UPDATE", "DELETE"]],
        msg: "Operation type must be one of CREATE, UPDATE, or DELETE",
      },
    },
  },
  timestamp: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  order_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  old_data: {
    type: Sequelize.JSONB,
    allowNull: true,
  },
  new_data: {
    type: Sequelize.JSONB,
    allowNull: true,
  },
  submitter_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  role: {
    type: Sequelize.STRING,
    allowNull: false,
  },
},
{
        timestamps: false,
        tableName: "order_logs",
});

module.exports = OrderLog;
