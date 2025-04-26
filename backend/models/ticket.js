const Sequelize = require("sequelize");
const db = require("../config/db");

const Ticket = db.define(
  "Ticket",
  {
    ticket_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: Sequelize.TEXT,
    created_by: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    assigned_to: Sequelize.INTEGER,
    status_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    priority_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    category_id: Sequelize.INTEGER,
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    tableName: "tickets",
    timestamps: false,
    underscored: true,
  }
);

module.exports = Ticket;
