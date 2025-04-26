// models/companyRevenueSummary.js

const { DataTypes } = require("sequelize");
const db = require("../config/db");

const CompanyRevenueSummary = db.define(
  "CompanyRevenueSummary",
  {
    company_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "company",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    total_revenue_generated: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: 0,
      },
    },
    total_number_of_contracts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0.0,
    },
    total_number_of_sales_contracts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0.0,
    },
    total_number_of_other_contracts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0.0,
    },
    total_sales_contracts_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: 0,
      },
    },
    total_other_contracts_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: 0,
      },
    },

    total_contracts_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: 0,
      },
    },

    total_revenue_to_be_generated: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: 0,
      },
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "company_revenue_summary",
    timestamps: false,
  }
);

function calculateTotals(instance) {
  // Calculate the total number of contracts
  instance.total_number_of_contracts =
    (instance.total_number_of_other_contracts || 0) +
    (instance.total_number_of_sales_contracts || 0);

  // Calculate the total contracts price
  instance.total_contracts_price =
    parseFloat(instance.total_other_contracts_price || 0) +
    parseFloat(instance.total_sales_contracts_price || 0);
}

// Add hooks
CompanyRevenueSummary.beforeSave((instance) => {
  calculateTotals(instance);
});

CompanyRevenueSummary.beforeCreate((instance) => {
  calculateTotals(instance);
});

CompanyRevenueSummary.beforeUpdate((instance) => {
  calculateTotals(instance);
});

module.exports = CompanyRevenueSummary;
