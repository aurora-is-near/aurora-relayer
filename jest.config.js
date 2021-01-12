module.exports = {
  testEnvironment: 'node',
  coverageDirectory: './coverage/',
  collectCoverage: true,
  testTimeout: 30000,
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
