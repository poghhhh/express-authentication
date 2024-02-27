const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dto = require('lodash');
const tokenResponseModel = require('../DTOs/authenticationDTOs/tokenResponseDTO');
require('dotenv').config();

// Login controller
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({
      where: { username: username.toLowerCase() },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Compare passwords asynchronously
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create access token with a shorter expiration time (e.g., 15 minutes)
    const accessToken = jwt.sign(
      { username: user.username, id: user.id },
      process.env.SECRET_ACCESS_TOKEN_KEY,
      { expiresIn: '1d' }
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.SECRET_REFRESH_TOKEN_KEY,
      {
        expiresIn: '7d',
      }
    );

    await user.update({ refreshToken });
    // Use the token response model to structure the response
    const tokenResponse = dto.pick(
      { accessToken, refreshToken },
      Object.values(tokenResponseModel)
    );

    // Return the token response
    res.json(tokenResponse);
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Refresh token controller
exports.refreshToken = async (req, res) => {
  const refreshToken = req.body.refreshToken;
  const user = await User.findOne({ where: { refreshToken: refreshToken } });

  if (!user) return res.status(403).json({ message: 'Invalid token' });

  // Generate new refresh token and new access token
  const newAccessToken = jwt.sign(
    { username: user.username, id: user.id },
    process.env.SECRET_ACCESS_TOKEN_KEY,
    { expiresIn: '1d' }
  );
  const newRefreshToken = jwt.sign(
    { id: user.id },
    process.env.SECRET_REFRESH_TOKEN_KEY,
    { expiresIn: '7d' }
  );

  // Update refresh token in database with the new refresh token generated
  user.refreshToken = newRefreshToken;
  await user.save();

  // Consider saving the updated user object to the database

  res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
};

// Register controller
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      refreshToken: null, // You can set a default value for refreshToken if necessary
    });

    // You can generate and return an access token here if needed

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
