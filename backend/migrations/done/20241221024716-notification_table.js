'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add the columns with default values
    await queryInterface.addColumn('notifications', 'notification_type_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'notification_types', // Ensure this matches your NotificationType table name
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      defaultValue: 1, // Use a valid notification type ID as a dummy value
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the columns when rolling back
    await queryInterface.removeColumn('notifications', 'notification_type_id');
    await queryInterface.removeColumn('notifications', 'order_id');
    await queryInterface.removeColumn('notifications', 'status');
  },
};