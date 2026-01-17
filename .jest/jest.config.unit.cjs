/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  rootDir: '..',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.unit.tests.ts'],
  clearMocks: true,
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts', '!<rootDir>/src/**/*.tests.ts'],
  coverageDirectory: '<rootDir>/coverage/unit',
  verbose: false,
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'commonjs',
        },
      },
    ],
  },
};
