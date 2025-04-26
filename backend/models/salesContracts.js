const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SalesContract = sequelize.define(
  "SalesContract",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "vendor",
        key: "id",
      },
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "company",
        key: "id",
      },
    },
    issue_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    termination_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    liwan: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    client: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    unit_delivery_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    unit_number: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    unit_total_space: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    due_payment: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total_paid: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    delivery_of_contract: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    contract_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    payment_schedule: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "pending",
    },
    attachment: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "sales_contracts",
    timestamps: true,
    underscored: true,
  }
);

SalesContract.sync({ alter: true });

module.exports = SalesContract;
