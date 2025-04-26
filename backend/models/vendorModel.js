const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const validator = require("validator");
const Vendor = sequelize.define(
    'vendor',
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        name:{
            type: DataTypes.STRING,
            allowNull: false,
            unique: false,
        },
        nationality: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
              notNull: { msg: "nationality is required." },
              notEmpty: { msg: "nationality cannot be empty." },
            },
        },
        national_id_or_passport_number:{
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "national id is required." },
                notEmpty: { msg: "the id cannot be null cannot be empty." },
              }
        },
        telephone_number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
              msg: "This telephone number is already exist",
            },
          },
        phone_number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
              msg: "This phone number is already exist",
            },
          },
        address:{
            type: DataTypes.STRING,
            allowNull: true
        },
        email:{
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
        attachment: {
          type: DataTypes.JSON,
          allowNull: true,
          defaultValue: {
            national_ID : null,
            residence_ID: null,
            profilePic: null,
            backup : null
          },
        },
        signature: {
          type: DataTypes.TEXT,
          allowNull: true,
        }
    },
    {
        timestamps: false,
        tableName: "vendor",
    }
)

// Vendor.sync({ alter: true });
module.exports = Vendor