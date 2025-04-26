const Sequelize = require("sequelize");
const db = require("../config/db");

const Category = db.define(
    'Category',
    {
      category_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      category_name: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      description: Sequelize.TEXT,
    },
    {
      tableName: 'ticket_categories',
      timestamps: false,
      underscored: true,
    }
  );

  module.exports = Category;