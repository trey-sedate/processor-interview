module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
	setupFilesAfterEnv: ['./jest.setup.js'],
};
