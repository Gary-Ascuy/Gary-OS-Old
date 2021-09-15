import type { Config } from '@jest/types'

export default async (): Promise<Config.InitialOptions> => {
  return {
    preset: "ts-jest",
    verbose: true,
    testEnvironment: 'jsdom',
    modulePathIgnorePatterns: ['lib/'],
    roots: ['<rootDir>/src'],
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    coveragePathIgnorePatterns: [
      "/node_modules/"
    ],
  }
}
