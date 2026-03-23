import { env } from './env';

export const config = {
  port: parseInt(env.PORT, 10),
  env: env.NODE_ENV,
  database: {
    url: env.DATABASE_URL
  },
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET
  },
  frontendUrl: env.FRONTEND_URL,
  logLevel: env.LOG_LEVEL,
  serviceName: env.SERVICE_NAME
};

export { logger } from './logger';
