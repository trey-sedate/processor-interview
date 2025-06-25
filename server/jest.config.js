module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	clearMocks: true,
	testPathIgnorePatterns: ['/node_modules/', '/dist/'],
	setupFilesAfterEnv: ['./jest.setup.js'],
};
