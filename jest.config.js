export default {
  testEnvironment: 'node',
  testTimeout: 30000,
  preset: 'ts-jest/presets/default-esm',
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    "\\.[jt]sx?$": "ts-jest"
  },
  transformIgnorePatterns: [
    "node_modules/(?!(@aurora-is-near))"
  ],
  globalSetup: '<rootDir>/test/setup.js',
};
