const Sequelize = require("sequelize");
const db = require("../config/db");
const Department = db.define(
  "department",
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: {
        msg: "There is Department with this name already existed",
      },
      validate: {
        notNull: {
          msg: "name cannot be null",
        },
        notEmpty: {
          msg: "name are required",
        },
      },
    },
  },
  {
    timestamps: false,
    tableName: "department",
  }
);
module.exports = Department;
