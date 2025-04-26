const Sequelize = require("sequelize");
const db = require("../config/db");

const SignatureLog = db.define("signature_logs", {
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
  signature_id: {
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
  signer_email: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isEmail: { msg: "Signer email must be a valid email address" },
    },
  },
  performed_by: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
    },
    {
        timestamps: false,
        tableName: "signature_logs",
    }
);

module.exports = SignatureLog;
