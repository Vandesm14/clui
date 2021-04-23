import {current as _current, value as _value} from './stores.js';

let current = {commands};
_current.subscribe(val => current = val);

let value = '';
_value.subscribe(val => value = val);

let depth = 0;

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
	parse: function(string) {
		let raw = string;
		string = this.tokenize(string);
		let command = {commands};
		depth = 0;
		for (let token of string) {
			if (Object.keys(command.commands).includes(token)) { // if command exists
				if (raw[raw.indexOf(token) + token.length]) {
					command = command.commands[token];
					depth++;
				}
			// } else if (argument) {
			}
		}
		_current.update(val => command);
	},
	select: function(name) {
		let tokens = this.tokenize(value);
		if (Object.keys(current.commands).includes(name)) { // if command exists
			if (tokens.length > depth) { // If half-completed in CLI
				_value.update(val => [...tokens.slice(0, tokens.length - 1), name, ''].join(' '));
			} else {
				_value.update(val => [...tokens, name, ''].join(' '));
			}
			this.parse(value);
		// } else if (argument) {
		}
	},
	filter: function(string) {
		let tokens = this.tokenize(string);
		let name = tokens[tokens.length - 1];

		if (current?.args) {
			if (tokens.length > depth) { // If half-completed in CLI
				let args = current.args.filter(el => el.name.indexOf(name) !== -1);
	
				return args;
			} else {
				return current.args;
			}
		} else if (current?.commands) {
			if (tokens.length > depth) { // If half-completed in CLI
				let commands = Object.keys(current.commands).filter(el => el.indexOf(name) !== -1);
	
				let obj = {};
				commands.map(el => obj[el] = current.commands[el]);
	
				return obj;
			} else {
				return current.commands;
			}
		} else {
			return current.commands;
		}
	},
	setCurrent: function(name) {
		if (Object.keys(current.commands).includes(name)) { // if command exists
			console.log('set:', name);
			_current.update(val => current.commands[name]);
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
				} else { // Inside string
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