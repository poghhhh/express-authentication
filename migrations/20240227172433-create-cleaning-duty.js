'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CleaningDuties', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      cleaner_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users', // This should match the table name of the referenced model
          key: 'id', // This should match the primary key of the referenced model
        },
        onUpdate: 'CASCADE', // Optional: What to do on updates
        onDelete: 'CASCADE', // Optional: What to do on deletes
      },
      assign_date: {
        type: Sequelize.DATEONLY,
      },
      cleaning_date: {
        type: Sequelize.DATEONLY,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CleaningDuties');
  },
};
