const Sequelize = require("sequelize");
const db = require("../config/db");

const Status = db.define(
    'Status',
    {
      status_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      status_name: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      description: Sequelize.TEXT,
    },
    {
      tableName: 'ticket_statuses',
      timestamps: false,
      underscored: true,
    }
  );

  module.exports = Status;