/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    // Mock ESM-only nanoid for Jest (CJS)
    '^nanoid$': '<rootDir>/src/__tests__/mocks/nanoid.cjs',
    // Resolve .js to .ts for our src modules only (avoid breaking node_modules)
    '^(\\.{1,2}/(?:config|socket|routes|middleware|utils|services|controllers)/.*)\\.js$': '$1.ts',
    '^(\\.{1,2}/)app\\.js$': '$1app.ts',
    '^(\\./)(env|database|redis)\\.js$': '$1$2.ts',
    '^(\\./)(authRoutes|pollRoutes|userRoutes|adminRoutes|index)\\.js$': '$1$2.ts',
    '^(\\./)(pollService|authService|voteService)\\.js$': '$1$2.ts',
    '^(\\.\\./)(middleware|utils|services|controllers)/(.*)\\.js$': '$1$2/$3.ts',
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/__tests__/**', '!src/**/*.d.ts'],
  testTimeout: 20000,
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/loadEnv.js'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.jest.json',
        useESM: false,
        diagnostics: { ignoreCodes: ['151002'] },
      },
    ],
  },
};
