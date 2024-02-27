const express = require('express');
const routes = require('./routes/routes');
const { swaggerUi, specs } = require('./swaggerConfig');
const { verifyToken, jsonParser } = require('./middleware');

const app = express();

// Middleware
app.use(jsonParser); // Use the JSON body parser middleware
app.use(verifyToken); // Use the verifyToken middleware

// Routes
app.use('/', routes);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Start server
const PORT = process.env.PORT || 3111;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
