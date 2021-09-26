module.exports = () => {
  return {
    preset: 'ts-jest',
    verbose: true,
    testEnvironment: 'jsdom',
    modulePathIgnorePatterns: ['<rootDir>/lib/'],
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/lib/'],
    roots: ['<rootDir>/src'],
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    coveragePathIgnorePatterns: [
      '/node_modules/'
    ],
  }
}
