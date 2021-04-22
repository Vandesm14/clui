import {current as _current} from './stores.js';

let current = {commands};
_current.subscribe(value => {
	console.log('update:', value);
	current = value;
});

const clui = {
	execute: function(name) {
		if (Object.keys(current.commands).includes(name)) { // if command exists
			console.log('run:', name);
			// parse args
			// check args
			// run command
		} else {
			// command does not exist
		}
	},
	parse: function(value) {
		console.log('parse:', value);
		value = value.split(' ');
		if (Object.keys(current.commands).includes(value[0])) { // if command exists
			console.log('command exists');
			this.setCurrent(value[0]);
		} else {
			console.log('command does not exist');
		}
	},
	setCurrent: function(name) {
		if (Object.keys(current.commands).includes(name)) { // if command exists
			console.log('set:', name);
			_current.update(value => current.commands[name]);
		} else {
			// command does not exist
		}
	},
	tokenize: function(input) {
		let arr = input.split('');
		let tokens = [];
		let accumulator = '';
		let stringType = false;
		for (let i = 0; i < arr.length; i++) {
			const char = arr[i]
			if (char === ' ') {
				if (stringType === false) { // Not inside string
					tokens.push(accumulator);
					accumulator = '';
				} else {
					accumulator += char;
				}
			} else if (char === '"') {
				if (stringType === '"') { // Closing token
					stringType = false;
					accumulator += char;
					tokens.push(accumulator);
					accumulator = '';
					i++;
				} else if (stringType === "'") { // Ignore
					accumulator += char;
				} else { // New string
					accumulator += char;
					stringType = '"';
				}
			} else if (char === "'") {
				if (stringType === "'") { // Closing token
					stringType = false;
					accumulator += char;
					tokens.push(accumulator);
					accumulator = '';
					i++;
				} else if (stringType === '"') { // Ignore
					accumulator += char;
				} else { // New string
					accumulator += char;
					stringType = "'";
				}
			} else {
				accumulator += char;
			}
		}
		if (accumulator !== '') tokens.push(accumulator);
		return tokens;
	}
};

export default clui;