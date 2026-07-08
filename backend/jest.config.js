module.exports = {
  // Use Node environment for testing Express backend
  testEnvironment: 'node',
  // Glob patterns Jest uses to detect test files
  testMatch: ['**/tests/**/*.test.js'],
  // Show detailed logs during test execution
  verbose: true,
  // Force exit to prevent hanging processes (especially from unresolved DB connections)
  forceExit: true,
  // Automatically clear mock calls and instances before every test
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
