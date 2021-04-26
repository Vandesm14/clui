import onChange from 'on-change';

import {
	current as _current,
	value as _value,
	store as _store
} from './stores.js';

let current = {commands};
_current.subscribe(val => current = val);
let value = '';
_value.subscribe(val => value = val);
let storeMain = {};
_store.subscribe(val => storeMain = val);

const upd = (path, val, prevVal, name) => {
	_store.update(val => storeMain);
};

const store = onChange(storeMain, upd);

store.depth = 0;
store.argDepth = 0;
store.tokens = [];

const clui = {
	execute: function(name) {
		if (Object.keys(current.commands).includes(name)) { // if command exists
			// TODO: parse args
			// TODO: check args
			// TODO: run command
		} else {
			// TODO: command does not exist (toast message system)
		}
	},
	parse: function(string) { // parse CLI and check for completed commands
		let raw = string;
		let tokens = this.tokenize(string);
		let command = {commands};
		store.depth = 0;
		for (let token of tokens) {
			if (command?.commands && Object.keys(command.commands).includes(token)) { // if command exists
				if (raw[raw.lastIndexOf(token) + token.length] === ' ') {
					command = command.commands[token];
					store.depth++;
				}
			// } else if (argument) { // TODO: this
			}
		}
		store.tokens = tokens;
		_current.update(val => command);
	},
	select: function(name) { // select command or argument to be pushed to the CLI
		let tokens = this.tokenize(value);
		if (current?.commands && Object.keys(current?.commands).includes(name)) { // if command exists
			if (tokens.length > store.depth) { // If half-completed in CLI
				_value.update(val => [...tokens.slice(0, tokens.length - 1), name, ''].join(' '));
			} else {
				_value.update(val => [...tokens, name, ''].join(' '));
			}
			this.parse(value);
		} else if (current?.args && current.args.filter(el => !el.required && !el.isArg).some(el => el.name === name)) {
			if (tokens.length > store.depth) { // If half-completed in CLI
				_value.update(val => [...tokens.slice(0, tokens.length - 1), `--${name}`, ''].join(' '));
			} else {
				_value.update(val => [...tokens, `--${name}`, ''].join(' '));
			}
			this.parse(value);
		}
		console.log('args:', name, current, current?.args?.filter(el => !el.required && !el.isArg));
	},
	filter: function(string) { // filter commands and arguments for dropdown
		let tokens = this.tokenize(string);
		let name = tokens[tokens.length - 1];

		if (current?.args) {
			return this.getArgs(string);
		} else if (current?.commands) {
			if (tokens.length > store.depth) { // If half-completed in CLI
				let commands = Object.keys(current.commands).filter(el => el.indexOf(name) !== -1);
				let obj = {};
				commands.map(el => obj[el] = current.commands[el]);
				return obj;
			} else {
				return current.commands;
			}
		} else { // TODO: this should probably not need to exist
			return [];
		}
	},
	getArgs: function(string) { // get and order arguments for dropdown
		let tokens = this.tokenize(string);
		let params = current?.args.filter(el => el.required);
		let optional = current?.args.filter(el => !el.required && el.isArg);
		let flags = current?.args.filter(el => !el.required && !el.isArg);

		let separated = this.separateArgs(tokens.slice(store.depth), string);
		let param = [...params, ...optional][separated.withSpace.params.length];
		flags = flags.filter(el => !separated.flags.includes(el.name));

		return [param, ...flags].filter(el => el !== undefined);
	},
	separateArgs: function(tokens, string = '') { // separates arguments from tokens into flags and params
		let flags = [];
		let params = [];
		let args = 0;
		let withSpace = {params: [], flags: []};

		for (let i = 0; i < tokens.length; i++) {
			let token = tokens[i];

			if (token.startsWith('-')) { // is flag
				if (token.match(/^(-)(\w)+/g) !== null) { // short flag "-f"
					flags.push(...token.split('').slice(1).map(el => current?.args?.find(el2 => el2.short === el)?.name));
				} else if (token.match(/^(--)(.)+/g) !== null) { // long flag "--flag"
					let arg = current?.args?.find(el => el.name === token.substr(2));
					if (arg === undefined) continue;

					if (arg?.type !== 'boolean') {
						flags.push(arg.name);
						args++;
						i++;
					} else if (arg?.type === 'boolean') {
						flags.push(arg.name);
					} else {
						// TODO: arg does not exist (invalid CLI)
					}
				}
			} else { // parameter
				params.push(token);
				if (string[string.lastIndexOf(token) + token.length] === ' ') withSpace.params.push(token);
			}
		}

		store.argDepth = flags.length + withSpace.params.length + args;
		return {flags, params, withSpace};
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