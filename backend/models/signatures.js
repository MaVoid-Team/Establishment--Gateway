const Sequelize = require("sequelize");
const db = require("../config/db");

const Signature = db.define(
  "signatures",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    // Polymorphic Association for Signer
    signer_type: {
      type: Sequelize.ENUM("employee", "vendor", "company"),
      allowNull: false,
      validate: {
        isIn: {
          args: [["employee", "vendor", "company"]],
          msg: "Signer type must be either employee, vendor, or company",
        },
      },
    },
    signer_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    // Polymorphic Association for Object
    object_type: {
      type: Sequelize.ENUM("order", "document", "sales_contract"),
      allowNull: true,
      validate: {
        isIn: {
          args: [["order", "document", "sales_contract"]],
          msg: "Object type must be either order or document",
        },
      },
    },
    object_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    signature_data: {
      type: Sequelize.TEXT, // Changed to TEXT to accommodate large Data URLs
      allowNull: true,
      validate: {
        notEmpty: { msg: "Signature data cannot be empty" },
      },
    },
    signature_url: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    token: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    },
    expires_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    signed_at: {
      type: Sequelize.DATE,
      allowNull: true,
    }
  },
  {
    timestamps: false,
  }
);
Signature.sync({alter:true});
module.exports = Signature;
