const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { secretKey } = require('./config');

// Middleware for parsing JSON bodies
const jsonParser = bodyParser.json();

// Middleware for verifying the access token
const handleAccessToken = (req, res, next) => {
    // Extract the access token from the Authorization header
    const authHeader = req.headers['authorization'];

    // Skip token verification for specific routes
    if (req.path.startsWith('/api-docs')|| req.path === '/api/auth/login') {
        return next(); // Skip token verification for /api-docs route
    }

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const accessToken = authHeader.split(' ')[1];

        // Verify the access token
        jwt.verify(accessToken, secretKey, (err, decoded) => {
            if (err) {
                // Token verification failed
                return res.status(401).json({ message: 'Invalid access token' });
            } else {
                // Token is valid, attach the decoded payload to the request object
                req.user = decoded;
                next();
            }
        });
    } else {
        // No access token provided
        return res.status(401).json({ message: 'Access token is missing' });
    }
};



module.exports = { handleAccessToken, jsonParser };
