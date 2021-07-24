module.exports = function(wallaby) {
  return {
		autoDetect: true,
    testFramework: {
      configFile: './jest.config.js'
    },
		filesWithNoCoverageCalculated: [
			'src/**/*.types.ts',
			'src/**/*.d.ts',
			'src/commands.ts',
			'src/tests/**/*_commands.ts',
			'src/tests/**/*_command.ts',
			'src/main.ts'
		],
		// runMode: 'onsave'
  };
};