module.exports = {
  coverageReporters: [
    'json-summary',
    'lcov',
    'text'
  ],
  collectCoverageFrom: [
    'src/**'
  ],

  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },

  // Test spec file resolution pattern
  // Matches parent folder `tests` or `__tests__` and filename
  // should contain `test` or `spec`.
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  // Module file extensions for importing
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^nimma/legacy$': '<rootDir>/node_modules/nimma/dist/legacy/cjs/index.js',
    '^nimma/(.*)': '<rootDir>/node_modules/nimma/dist/cjs/$1',
  },

  testTimeout: 20000,
  
  setupFiles: ['./tests/jest.setup.ts'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
};
