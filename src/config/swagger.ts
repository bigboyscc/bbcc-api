import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BBCC API Documentation',
      version: '1.0.0',
      description: 'API documentation for BBCC (Cricket Club Management System)',
      contact: {
        name: 'BBCC Development Team'
      }
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server'
      },
      {
        url: 'https://api.bbcc.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts', './src/controllers/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
