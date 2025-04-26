const Sequelize = require("sequelize");
const db = require("../config/db");

const Priority = db.define(
    'Priority',
    {
      priority_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      priority_level: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      description: Sequelize.TEXT,
    },
    {
      tableName: 'ticket_priorities',
      timestamps: false,
      underscored: true,
    }
  );

  module.exports = Priority;