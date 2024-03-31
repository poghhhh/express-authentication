const express = require('express');
const routes = require('./routes/routes');
const { swaggerUi, specs } = require('./swaggerConfig');
const minioClient = require('./services/minio');
const { verifyToken, jsonParser } = require('./middleware');
require('./services/schedule');
const app = express();

// Middleware
app.use(jsonParser); // Use the JSON body parser middleware
app.use(verifyToken(app)); // Use the verifyToken middleware

// Routes
app.use('/', routes);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Create a bucket and list all buckets
(async () => {
  console.log(`Creating Bucket: Cleanning Duty`);
  await minioClient
    .makeBucket('cleanning-duty', 'us-east-1')
    .then(() => {
      console.log(`Bucket 'cleanning-duty' created successfully.`);
    })
    .catch((e) => {
      console.log(`Error while creating bucket 'cleanning-duty': ${e.message}`);
    });
})();

// Start server
const PORT = process.env.PORT || 3111;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
