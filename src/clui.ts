const clui = {
	execute: (name) => {
		if (Object.keys(commands).includes(name)) {
			console.log('run:', name);
			// parse args
			// check args
			// run command
		} else {
			// command does not exist
		}
	},
	parse: (value) => {
		console.log('parse:', value);
	}
};

export default clui;