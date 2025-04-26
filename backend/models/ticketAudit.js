const Sequelize = require("sequelize");
const db = require("../config/db");

const TicketAudit = db.define(
  "TicketAudit",
  {
    audit_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ticket_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    changed_by: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    changed_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    old_status_id: Sequelize.INTEGER,
    new_status_id: Sequelize.INTEGER,
    old_priority_id: Sequelize.INTEGER,
    new_priority_id: Sequelize.INTEGER,
    old_category_id: Sequelize.INTEGER,
    new_category_id: Sequelize.INTEGER,
  },
  {
    tableName: "ticket_audit",
    timestamps: false,
    underscored: true,
  }
);

module.exports = TicketAudit;
