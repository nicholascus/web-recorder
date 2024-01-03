module.exports = {
    testMatch: ['**/?(*.)+(spec|test).+(ts|tsx|js)', '!**/e2e/**/*.test.ts'],
    testEnvironment: 'node',
    collectCoverage: false,
    coverageReporters: ['json', 'lcov', 'text', 'clover'],
    testPathIgnorePatterns: ['/node_modules/', '/out/', '/dist/', 'mock-*'],
};
