const Sequelize = require("sequelize");
const db = require("../config/db");
const Signature = require("./signatures");
const Company = db.define(
  "company",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Company name cannot be null",
        },
        notEmpty: {
          msg: "Company name is required",
        },
      },
    },
    phone_number: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Phone number cannot be null",
        },
        notEmpty: {
          msg: "Phone number is required",
        },
        isNumeric: {
          msg: "Phone number must contain only numbers",
        },
      },
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Email cannot be null",
        },
        notEmpty: {
          msg: "Email is required",
        },
        isEmail: {
          msg: "Must be a valid email address",
        },
      },
    },
    location: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    cr: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "CR cannot be null",
        },
        notEmpty: {
          msg: "CR is required",
        },
      },
    },
    vat: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "VAT cannot be null",
        },
        notEmpty: {
          msg: "VAT is required",
        },
      },
    },
    attachment: {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: {
        CR: null,
        VAT: null,
        profilePic: null,
        backup : null
      },
    },
     signature: {
        type: Sequelize.TEXT,
        allowNull: true,
    }
  },
  {
    tableName: "company",
    timestamps: false,
  }
);

// Company.sync({ alter: true });

module.exports = Company;
