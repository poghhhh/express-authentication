const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { secretKey } = require('../config');

// Login controller
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ where: { username: username.toLowerCase() } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Compare passwords asynchronously
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create access token with a shorter expiration time (e.g., 15 minutes)
        const accessToken = jwt.sign({ username: user.username, id: user.id }, secretKey, { expiresIn: '15m' });

        // Consider including user data or additional information in the access token payload

        res.json({ accessToken });
    } catch (error) {
        console.error('Error finding user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Logout controller
exports.logout = (req, res) => {
    res.json({ message: 'Logout successful' });
};
