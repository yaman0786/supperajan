/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@supperajan/types$': '<rootDir>/../../packages/types/src/index.ts',
    '^@supperajan/observability$': '<rootDir>/../../packages/observability/src/index.ts',
    '^@supperajan/ai$': '<rootDir>/../../packages/ai/src/index.ts',
    '^@supperajan/knowledge$': '<rootDir>/../../packages/knowledge/src/index.ts',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true, tsconfig: { module: 'ESNext' } }],
  },
  testMatch: ['**/*.spec.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.module.ts', '!src/main.ts'],
  coverageDirectory: 'coverage',
};
