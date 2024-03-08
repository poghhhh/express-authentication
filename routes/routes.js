/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

const express = require('express');
const router = express.Router();
const {
  login,
  refreshToken,
  register,
} = require('../controllers/AuthenticationController');
const { getAllUsers, getUserById } = require('../controllers/UsersController');
const {
  arrangeCleaningDuties,
  getCleaningDuties,
} = require('../controllers/CleanningDutyController');

/**
 * @swagger
 * securityDefinitions:
 *   bearerAuth:
 *     type: apiKey
 *     name: Authorization
 *     scheme: bearer
 *     in: header
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successfully logged in
 *       '401':
 *         description: Unauthorized
 */
router.post('/api/auth/login', login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successfully registered
 *       '409':
 *         description: User already exists
 *       '500':
 *         description: Internal server error
 */
router.post('/api/auth/register', register);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved users
 *       '500':
 *         description: Internal server error
 */
router.get('/api/users', getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *         description: User ID
 *     responses:
 *       '200':
 *         description: Successfully retrieved user
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */
router.get('/api/users/:id', getUserById);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successfully refreshed token
 *       '403':
 *         description: Invalid token
 */
router.post('/api/auth/refresh-token', refreshToken);

/**
 * @swagger
 * /api/cleaning-duties/arrange:
 *   post:
 *     summary: Arrange cleaning duties
 *     tags: [Cleaning Duties]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Cleaning duties arranged successfully
 *       '500':
 *         description: Internal server error
 */
router.post('/api/cleaning-duties/arrange', arrangeCleaningDuties);

/**
 * @swagger
 * /api/cleaning-duties/{year}/{month}:
 *   get:
 *     summary: Get cleaning duties
 *     tags: [Cleaning Duties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         type: string
 *         format: date
 *       - in: path
 *         name: month
 *         required: true
 *         type: string
 *         format: date
 *     responses:
 *       '200':
 *         description: Successfully retrieved cleaning duties
 *       '400':
 *         description: Invalid month or year
 *       '500':
 *         description: Internal server error
 */
router.get('/api/cleaning-duties/:year/:month', getCleaningDuties);

module.exports = router;
