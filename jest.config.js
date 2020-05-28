module.exports = {
  moduleFileExtensions: ['js'],
  setupFilesAfterEnv: ['@parcel/test-utils/src/setup.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/packages/*/!(parcel-bundler|integration-tests)/test/*.js'],
  bail: 10,
};
