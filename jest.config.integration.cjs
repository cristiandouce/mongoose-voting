const base = require('./jest.config.base.cjs');

/** @type {import('jest').Config} */
module.exports = {
  ...base,
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.integration.test.ts'],
  testTimeout: 30000,
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coverageDirectory: '<rootDir>/coverage/integration',
};
