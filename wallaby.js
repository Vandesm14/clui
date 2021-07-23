module.exports = function(wallaby) {
  return {
		autoDetect: true,
    testFramework: {
      configFile: './jest.config.js'
    }
  };
};