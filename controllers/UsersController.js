const { User } = require('../models');
const dto = require('lodash');
const userResponseModel = require('../DTOs/usersDTOs/userResponseDTO');

// Controller to get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        
        // Map over the users array and pick only the required properties using lodash(dto)
        const filteredUsers = users.map(user => dto.pick(user, Object.values(userResponseModel)));
        
        // Return the filteredUsers array in the response
        res.json(filteredUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
