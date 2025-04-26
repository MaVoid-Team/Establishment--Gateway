'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Fetch all employees to update their attachments
    const employees = await queryInterface.sequelize.query(
      'SELECT id, attachment FROM employee;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    for (const employee of employees) {
      // Parse the existing attachments JSON
      const currentAttachments = employee.attachment || {};
      const updatedAttachments = {
        ...currentAttachments,
        profilePic: currentAttachments.profilePic ?? null, // Ensure `profilePic` key exists
      };

      // Update the employee's attachment column
      await queryInterface.sequelize.query(
        'UPDATE employee SET attachment = :attachment WHERE id = :id;',
        {
          replacements: {
            attachment: JSON.stringify(updatedAttachments),
            id: employee.id,
          },
        }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // Reverse the migration: remove the `profilePic` key from attachments
    const employees = await queryInterface.sequelize.query(
      'SELECT id, attachment FROM employee;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    for (const employee of employees) {
      const currentAttachments = employee.attachment || {};
      const { profilePic, ...rest } = currentAttachments; // Exclude the `profilePic` key

      await queryInterface.sequelize.query(
        'UPDATE employee SET attachment = :attachment WHERE id = :id;',
        {
          replacements: {
            attachment: JSON.stringify(rest),
            id: employee.id,
          },
        }
      );
    }
  },
};