export const jestConfig = {
  testEnvironment: 'node',
  testTimeout: 10000,
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: [
    '**/__tests__/**/*.js',
    '**/*.test.js',
    '**/*.spec.js',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/coverage/', '/uploads/'],
  moduleFileExtensions: ['js', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  setupFiles: ['<rootDir>/jest/jest.env.js'],
  setupFilesAfterEnv: ['<rootDir>/jest/jest.setup.js'],
  globalSetup: '<rootDir>/jest/jest.globalSetup.js',
  globalTeardown: '<rootDir>/jest/jest.globalTeardown.js',
  testSequencer: '<rootDir>/jest/jest.sequencer.js',
};
