const { DataTypes } = require("sequelize");

const db = require("../config/db");

const VendorRevenueSummary = db.define(
  "VendorRevenueSummary",
  {
    vendor_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "vendor",
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

    total_revenue_to_be_generated: {
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
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "vendor_revenue_summary",
    timestamps: false,
  }
);
// Define shared logic to calculate totals
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
VendorRevenueSummary.beforeSave((instance) => {
  // console.log("Before Save Hook - Instance:", instance);

  calculateTotals(instance);

  // console.log("After Calculating Totals - Instance:", instance);
});

VendorRevenueSummary.beforeCreate((instance) => {
  // console.log("Before Create Hook - Instance:", instance);
  calculateTotals(instance);
});

VendorRevenueSummary.beforeUpdate((instance) => {
  // console.log("Before Update Hook - Instance:", instance);
  calculateTotals(instance);
});

module.exports = VendorRevenueSummary;
