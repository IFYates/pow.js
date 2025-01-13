export default {
    setupFilesAfterEnv: ['./_setup.js'],
    testEnvironment: 'jsdom',
    testMatch: ['**/*.tests.js'],
    clearMocks: true,
    globals: { module: '../src/pow.js' }
}