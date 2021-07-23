module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
	collectCoverageFrom: [
		// 'src/**/*.test.ts' // tests only
		'src/**/*.ts' // full coverage
	],
	// coveragePathIgnorePatterns: [
	// 	'src/**/*.types.ts',
	// 	'src/global.d.ts',
	// 	'main.ts'
	// ]
};