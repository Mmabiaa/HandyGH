import { SwaggerOptions } from 'swagger-ui-express';

const swaggerOptions: SwaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'HandyGH API',
      version: '1.0.0',
      description: 'API documentation for HandyGH, a local services marketplace for Ghana.',
      contact: {
        name: 'HandyGH Support',
        url: 'https://handygh.com/support',
        email: 'support@handygh.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

export default swaggerOptions;