const Sequelize = require("sequelize");
const db = require("../config/db");

const Attachment = db.define(
    'Attachment',
    {
      attachment_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      ticket_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      file_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      file_path: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      uploaded_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      tableName: 'attachments',
      timestamps: false,
      underscored: true,
    }
  );

  module.exports = Attachment;