const Sequelize = require("sequelize");
const db = require("../config/db");

const DocumentLog = db.define("document_logs", {
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
  document_id: {
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
  document_type: {
    type: Sequelize.STRING,
    allowNull: false,
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
    tableName: "document_logs",
});

module.exports = DocumentLog;
