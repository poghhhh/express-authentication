const { User } = require('../models');
const dto = require('lodash');
const userResponseModel = require('../DTOs/usersDTOs/userResponseDTO');

// Controller to get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();

    // Map over the users array and pick only the required properties using lodash(dto)
    const filteredUsers = users.map((user) =>
      dto.pick(user, Object.values(userResponseModel))
    );

    // Return the filteredUsers array in the response
    res.json(filteredUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const filteredUser = dto.pick(user, Object.values(userResponseModel));

    res.json(filteredUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }

  exports.updateInformation = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, avatarUrl } = req.body;

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.name = name;
      user.email = email;
      user.avatarUrl = avatarUrl;

      await user.save();

      const filteredUser = dto.pick(user, Object.values(userResponseModel));

      res.json(filteredUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};
