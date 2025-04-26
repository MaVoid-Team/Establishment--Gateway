// models/Employee.js
const { DataTypes } = require("sequelize");
const validator = require("validator");
const db = require("../config/db"); // Import Sequelize instance
const crypto = require("crypto");
const Employee = db.define(
  "employee",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: "This email already exists",
      },
      validate: {
        isEmail: {
          msg: "Please provide a valid email address",
        },
      },
      set(value) {
        this.setDataValue("email", value.toLowerCase());
      },
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: "This phone number is already exist",
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "Password is required." },
        notEmpty: { msg: "Password cannot be empty." },
        len: {
          args: [8, 100],
          msg: "Password must be at least 8 characters long.",
        },
      },
    },
    nationality: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "nationality is required." },
        notEmpty: { msg: "nationality cannot be empty." },
      },
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "department",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    extension_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: "Extension number is required." },
        isInt: {
          args: true,
          msg: "Extension number must be an integer.",
        },
        isFourDigits(value) {
          const valueString = value.toString().padStart(4, "0");
          if (!validator.isInt(valueString, { min: 0, max: 9999 })) {
            throw new Error(
              "Extension number must be a 4-digit number, from 0000 to 9999."
            );
          }
        },
      },
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "roles",
        key: "id",
      },

      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    role_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Medical_conditions: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    Accessibility_Needs: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Home_Address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Emergency_Contact: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Personal_Email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    attachment: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        nationalId: null,
        passport: null,
        residencyPermit: null,
        profilePic: null,
        backup: null,
      },
    },
    links: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    signature: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: "employee",
  }
);
Employee.prototype.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

// Employee.sync({ alter: true });

module.exports = Employee;
