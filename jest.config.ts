/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest'

const config: Config = {
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    testMatch: ['**/*.test.{js,ts}'],
    transform: {
        '^.+\\.(t|j)sx?$': '@swc/jest'
    }
}

export default config
