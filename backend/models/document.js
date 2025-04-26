const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Document = sequelize.define(
  "Document",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        notEmpty: true
      }
    },
    client: {
      type: DataTypes.STRING,
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
    contract_value: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
      get() {
        return parseInt(this.getDataValue('contract_value')) || 0;
      }
    },
    change_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      get() {
        return parseInt(this.getDataValue('change_order')) || 0;
      }
    },
    modified_contract_value: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM(
        "construction contracts",
        "engineering consultancy contracts",
        "marketing contracts",
        "financial services contracts",
        "legal consultancy contracts",
        "design contracts",
        "government contracts",
        "management and operation contracts",
        "lease contracts",
        "maintenance contracts",
        "security services contracts",
        "project development contracts"
      ),
      allowNull: false,
    },
    attachment: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    amount_paid: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    amount_due: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    tableName: "documents",
    timestamps: true,
    underscored: true,
  }
);
// Add hooks to calculate `modified_contract_value`
Document.beforeSave((document) => {
  document.modified_contract_value =
    document.contract_value + document.change_order;
});

Document.beforeCreate((document) => {
  document.modified_contract_value =
    document.contract_value + document.change_order;
});

Document.beforeUpdate((document) => {
  document.modified_contract_value =
    document.contract_value + document.change_order;
});

Document.sync({ alter: true });

module.exports = Document;
