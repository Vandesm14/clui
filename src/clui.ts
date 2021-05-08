import onChange from 'on-change';
import type * as types from './clui.types';

import {
	current as _current,
	value as _value,
	store as _store
} from './stores.js';

// @ts-expect-error
let current: types.Command = {commands};
_current.subscribe((val: types.Command) => current = val);
let value = '';
_value.subscribe(val => value = val);
let storeMain: types.storeMain = {};
_store.subscribe(val => storeMain = val);

const upd = (path, val, prevVal, name) => {
	_store.set(storeMain);
};

const store: types.storeMain = onChange(storeMain, upd);

store.depth = 0;
store.argDepth = 0;
store.tokens = [];
store.pages = [];
store.toasts = [];

class Page {
	args: types.Arg[];
	isForm: boolean;
	
	constructor(args: types.Arg[], isForm?: boolean) {
		this.args = args;
		this.isForm = isForm;
		
		if (isForm) {
			// append form button
		}
		
		store.pages.push(this);
	}
	
	close(this): void {
		store.pages.splice(this, 1);
	}
};

class Toast {
	msg: string;
	color: string;

	constructor(msg: string, color?: 'red' | 'yellow' | 'green') {
		this.msg = Array.isArray(msg) ? msg.join(' ') : msg;
		this.color = color;
		
		store.toasts.push(this);
		setTimeout(() => {
			// @ts-expect-error
			store.toasts.splice(this, 1);
		}, 3000);
	}
};

const clui = {
	Toast,
	execute: function(string: string) {
		if (current?.run) { // if command has run function
			console.log('run', current);
			// TODO: parse args
			// TODO: check args
			// TODO: run command

			new Page([], true);
			// @ts-expect-error
			_current.set({commands});
			_value.set('');
			store.tokens = [];
			store.depth = 0;
			store.argDepth = 0;
		} else {
			console.log('no run', current);
			// TODO: command does not have run function (toast message system)
		}
	},
	parse: function(string: string) { // parse CLI and check for completed commands
		let raw = string;
		let tokens = this.tokenize(string);

		// @ts-expect-error
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
		_current.set(command);
	},
	select: function(name: string) { // select command or argument to be pushed to the CLI
		let tokens = this.tokenize(value);
		if (current?.commands && Object.keys(current?.commands).includes(name)) { // if command exists
			if (tokens.length > store.depth) { // If half-completed in CLI
				_value.set([...tokens.slice(0, tokens.length - 1), name, ''].join(' '));
			} else {
				_value.set([...tokens, name, ''].join(' '));
			}
			this.parse(value);
		} else if (current?.args && current.args.filter(el => !el.required && !el.isArg).some(el => el.name === name)) {
			if (tokens.length > store.depth) { // If half-completed in CLI
				_value.set([...tokens.slice(0, tokens.length - 1), `--${name}`, ''].join(' '));
			} else {
				_value.set([...tokens, `--${name}`, ''].join(' '));
			}
			this.parse(value);
		}
	},
	filter: function(string: string) { // filter commands and arguments for dropdown
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
	getArgs: function(string: string) { // get and order arguments for dropdown
		let tokens = this.tokenize(string);
		let params = current?.args.filter(el => el.required);
		let optional = current?.args.filter(el => !el.required && el.isArg);
		let flags = current?.args.filter(el => !el.required && !el.isArg);

		let separated = this.separateArgs(tokens.slice(store.depth), string);
		let param = [...params, ...optional][separated.withSpace.params.length];
		flags = flags.filter(el => !separated.flags.includes(el.name));

		return [param, ...flags].filter(el => el !== undefined);
	},
	separateArgs: function(tokens: string[], string = '') { // separates arguments from tokens into flags and params
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
	setCurrent: function(name: string) {
		if (Object.keys(current.commands).includes(name)) { // if command exists
			_current.update(val => current.commands[name]);
		} else {
			// TODO: command does not exist (toast message system)
		}
	},
	tokenize: function(input: string) {
		let arr = input.split('');
		let tokens = [];
		let accumulator = '';
		let stringType: false | string = false;
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