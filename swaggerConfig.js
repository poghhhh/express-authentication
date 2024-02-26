const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Your API Title',
            version: '1.0.0',
            description: 'API documentation for your Express.js application',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'Authorization',
                    description: "Enter 'Bearer ' followed by your token",
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./routes/routes.js'], // Path to the API routes folder
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
