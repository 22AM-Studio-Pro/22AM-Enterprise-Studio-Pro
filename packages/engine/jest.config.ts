import { defineConfig } from 'jest';

export default defineConfig({
  preset: 'ts-jest',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'ES2020',
        },
      },
    ],
  },
  moduleNameMapper: {
    '^@22am-enterprise/database$': '<rootDir>/../../database/dist/index.js',
    '^@22am-enterprise/shared$': '<rootDir>/../../shared/dist/index.js',
  },
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
});
