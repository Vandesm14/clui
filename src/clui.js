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
			// TODO: parse args
			// TODO: check args
			// TODO: run command
		} else {
			// TODO: command does not exist (toast message system)
		}
	},
	parse: function(string) {
		let raw = string;
		string = this.tokenize(string);
		let command = {commands};
		depth = 0;
		for (let token of string) {
			if (command?.commands && Object.keys(command.commands).includes(token)) { // if command exists
				if (raw[raw.indexOf(token) + token.length] === ' ') {
					command = command.commands[token];
					depth++;
				}
			// } else if (argument) { // TODO: this
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
		// } else if (argument) { // TODO: this
		}
	},
	filter: function(string) {
		let tokens = this.tokenize(string);
		let name = tokens[tokens.length - 1];

		if (current?.args) {
			return this.getArgs(string);
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
			// TODO: this should probably not need to exist
			return current.commands;
		}
	},
	getArgs: function(string) {
		let tokens = this.tokenize(string);
		let params = current?.args.filter(el => el.required);
		let optional = current?.args.filter(el => !el.required && el.isArg);
		let flags = current?.args.filter(el => !el.required && !el.isArg);
		let separated = this.separateArgs(tokens.slice(depth));

		let param = [...params, ...optional][separated.params.length];
		flags = flags.filter(el => !separated.flags.includes(el.name));
		
		// TODO: only show next param if a space follows the previous command/flag


		return [param, ...flags];
	},
	separateArgs: function(tokens) {
		let flags = [];
		let params = [];

		for (let i = 0; i < tokens.length; i++) {
			let token = tokens[i];

			if (token.startsWith('-')) { // is flag
				if (token.match(/^(-)(\w)+/g) !== null) { // short flag "-f"
					flags.push(token.split('').slice(1));
				} else if (token.match(/^(--)(.)+/g) !== null) { // long flag "--flag"
					let arg = current?.args?.find(el => el.name === token.substr(2));
					if (arg === undefined) continue;

					if (arg?.type !== 'boolean') {
						// flags.push([arg.name, tokens[i+1]]);
						flags.push(arg.name);
						i++;
					} else if (arg?.type === 'boolean') {
						flags.push(arg.name);
					} else {
						// TODO: arg does not exist (invalid CLI)
					}
				}
			} else { // parameter
				params.push(token);
			}
		}

		return {flags, params};
	},
	setCurrent: function(name) {
		if (Object.keys(current.commands).includes(name)) { // if command exists
			_current.update(val => current.commands[name]);
		} else {
			// TODO: command does not exist (toast message system)
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