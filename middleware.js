const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware for parsing JSON bodies
const jsonParser = bodyParser.json();

// Middleware for verifying the access token
const verifyToken = (req, res, next) => {
  // Extract the access token from the Authorization header
  const authHeader = req.headers['authorization'];

  // Skip token verification for specific routes
  if (
    req.path.startsWith('/api-docs') ||
    req.path === '/api/auth/login' ||
    req.path === '/api/auth/register'
  ) {
    return next(); // Skip token verification for /api-docs route
  }

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const accessToken = authHeader.split(' ')[1];

    // Verify the access token
    jwt.verify(
      accessToken,
      process.env.SECRET_ACCESS_TOKEN_KEY,
      (err, decoded) => {
        if (err) {
          // Token verification failed
          if (err.name == 'TokenExpiredError') {
            return res.status(401).json({ message: err.message });
          } else {
            return res.status(401).json({ message: err.message });
          }
        } else {
          // Token is valid, attach the decoded payload to the request object
          req.user = decoded;
          next();
        }
      }
    );
  } else {
    // No access token provided
    return res.status(401).json({ message: 'Access token is missing' });
  }
};

module.exports = { verifyToken, jsonParser };
