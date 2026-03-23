// Jest setup file for test configuration
// This runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-secret-key-for-jwt-access-token-at-least-32-chars';
process.env.JWT_REFRESH_SECRET = 'test-secret-key-for-jwt-refresh-token-at-least-32-chars';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/bbcc-test';
process.env.PORT = '5001';
process.env.FRONTEND_URL = 'http://localhost:3000';

// Increase timeout for database operations
jest.setTimeout(30000);
