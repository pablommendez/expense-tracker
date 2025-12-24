/**
 * Jest setup file
 * Runs before all tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';

// Note: Global test timeout is configured in jest.config.js (testTimeout: 60000)

// Clean up after all tests
afterAll(async () => {
  // Add any global cleanup here
});
