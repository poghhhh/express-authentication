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
          email: 'admin@example.com',
          name: 'Admin',
          avatar_url:
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwdRIXfjIoZZgo4WdJ4nvjWbYIP0Oe6zGDn10RveeYkg&s',
          password: hashedPassword,
          date_of_birth: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          refresh_token: null,
          phone_number: null,
          is_admin: true,
        },
        {
          username: 'user1',
          email: 'user1@example.com',
          name: 'User1',
          avatar_url:
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwdRIXfjIoZZgo4WdJ4nvjWbYIP0Oe6zGDn10RveeYkg&s',
          password: hashedPassword,
          date_of_birth: '1/1/1990',
          createdAt: new Date(),
          updatedAt: new Date(),
          refresh_token: null,
          phone_number: '0289371231',
          is_admin: false,
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  },
};
