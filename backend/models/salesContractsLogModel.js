const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SalesContractLog = sequelize.define(
  "SalesContractLog",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    operation_type: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        isIn: {
          args: [["CREATE", "UPDATE", "DELETE"]],
          msg: "Operation type must be one of CREATE, UPDATE, DELETE",
        },
      },
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    sales_contract_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "SalesContract",
        key: "id",
      },
    },
    old_data: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    new_data: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    performed_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Employee",
        key: "id",
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "sales_contract_logs",
    timestamps: true,
    underscored: true,
  }
);

module.exports = SalesContractLog;
