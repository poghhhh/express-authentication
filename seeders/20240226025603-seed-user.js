'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('12345678', 10);

    await queryInterface.bulkInsert(
      'Users',
      [
        {
          username: 'admin',
          name: 'Admin',
          email: 'admin@example.com',
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
          refresh_token: null,
          avatar_url:
            'https://www.testhouse.net/wp-content/uploads/2021/11/default-avatar.jpg',
          isAdmin: true,
        },
        {
          username: 'user1',
          name: 'Nguyễn Văn Chơi',
          email: 'user1@example.com',
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
          refresh_token: null,
          avatar_url:
            'https://www.testhouse.net/wp-content/uploads/2021/11/default-avatar.jpg',
          isAdmin: false,
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  },
};
