import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import { connectDatabase } from '@/config/database';

const PORT = parseInt(env.PORT, 10) || 5000;
let server: Server;

async function startServer() {
  try {
    await connectDatabase();

    server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(
        {
          port: PORT,
          env: env.NODE_ENV,
          nodeVersion: process.version
        },
        `🚀 Server running on port ${PORT}`
      );

      logger.info(`📚 API Docs available at http://localhost:${PORT}/api-docs`);
      logger.info(`❤️  Health check at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

// Graceful shutdown function
async function gracefulShutdown(signal: string) {
  logger.info(`\n${signal} signal received: closing HTTP server`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');

      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed');
        logger.info('Goodbye! 👋');
        process.exit(0);
      } catch (error) {
        logger.error({ error }, 'Error during MongoDB disconnection');
        process.exit(1);
      }
    });

    // Force exit after 10 seconds if graceful shutdown fails
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  } else {
    logger.info('No server to close, exiting...');
    process.exit(0);
  }
}

// Handle graceful shutdown on SIGINT (Ctrl+C) and SIGTERM
process.on('SIGINT', () => {
  logger.info('\nReceived SIGINT (Ctrl+C)');
  gracefulShutdown('SIGINT');
});

process.on('SIGTERM', () => {
  logger.info('\nReceived SIGTERM');
  gracefulShutdown('SIGTERM');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  logger.error({ reason }, 'Unhandled Promise Rejection');
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error({ error }, 'Uncaught Exception');
  process.exit(1);
});

startServer();
