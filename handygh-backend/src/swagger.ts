import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { swaggerConfig } from './config/swagger.config';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: swaggerConfig.title,
      version: swaggerConfig.version,
      description: swaggerConfig.description,
    },
    servers: [
      {
        url: swaggerConfig.baseUrl,
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};