/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  globals: {
    "ts-jest": {
      "useESM": true
    }
  },
  testEnvironment: 'node',
  testTimeout: 30000,
  transform: {
    "\\.[jt]sx?$": "ts-jest"
  },
  transformIgnorePatterns: [
    "/node_modules/(?!@aurora-is-near/engine/)"
  ],
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node"
  ]
};
