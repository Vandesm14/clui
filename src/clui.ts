'use strict';

import onChange from 'on-change';
import type * as types from './clui.types';

import {
	current as _current,
	value as _value,
	store as _store
} from './stores.js';

let current: types.Command;
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
			this.args.push({name: 'submit', value: 'submit', type: 'button', run: () => {
				console.log('clicked!!!!');
			}});
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
	id: {};

	constructor(msg: string, color?: 'red' | 'yellow' | 'green') {
		this.msg = Array.isArray(msg) ? msg.join(' ') : msg;
		this.color = color;
		this.id = {};
		
		store.toasts.push(this);
		setTimeout(() => {
			// @ts-expect-error
			store.toasts.splice(this, 1);
		}, 3000);
	}
};

const clui = {
	Toast,
	Page,
	arg: (name, desc, type, options) => {
		return {name, desc, type, ...options};
	},
	init: function(commands: Record<string, types.Command>): void {
		_current.set({commands});
	},
	clear: function(): void {
		// @ts-expect-error
		_current.set({commands});
		_value.set('');
		store.tokens = [];
		store.depth = 0;
		store.argDepth = 0;
	},
	/** executes the current command */
	execute: function(): void {
		if (current?.run) { // if command has run function
			let args = clui.getArgs(value, true);
			// TODO: check args
			// TODO: run command

			if (args.length < current.args?.filter(el => el.required).length) { // if required args are not complete
				console.log('from form', current.args, args.length);
				new Page([...args, ...current.args.slice(args.length)], true);
			} else {
				console.log('normal');
				new Page(args);
			}

			clui.clear();
		} else {
			new Toast('Command does not have a run function', 'red');
		}
	},
	/** parses CLI and checks for completed commands */
	parse: function(string: string): void {
		let raw = string;
		let tokens = clui.tokenize(string);

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
	/** selects command or argument to be pushed to the CLI */
	select: function(name: string): void {
		let tokens = clui.tokenize(value);
		if (current?.commands && Object.keys(current?.commands).includes(name)) { // if command exists
			if (tokens.length > store.depth) { // If half-completed in CLI
				_value.set([...tokens.slice(0, tokens.length - 1), name, ''].join(' '));
			} else {
				_value.set([...tokens, name, ''].join(' '));
			}
			clui.parse(value);
		} else if (current?.args && current.args.filter(el => !el.required && !el.isArg).some(el => el.name === name)) {
			if (tokens.length > store.depth) { // If half-completed in CLI
				_value.set([...tokens.slice(0, tokens.length - 1), `--${name}`, ''].join(' '));
			} else {
				_value.set([...tokens, `--${name}`, ''].join(' '));
			}
			clui.parse(value);
		}
	},
	/** filters commands and arguments for dropdown */
	filter: function(string: string): types.Arg[] | Record<string, types.Command> {
		let tokens = clui.tokenize(string);
		let name = tokens[tokens.length - 1];

		if (current?.args) {
			return clui.getArgs(string);
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
			new Toast('filter: Command has no children', 'yellow');
		}
	},
	/** gets and orders arguments for dropdown */
	getArgs: function(string: string, inverse = false): types.Arg[] {
		let tokens = clui.tokenize(string);
		let params = current?.args.filter(el => el.required);
		let optional = current?.args.filter(el => !el.required && el.isArg);
		let flags = current?.args.filter(el => !el.required && !el.isArg);

		if (!inverse) { // filter unused args
			let separated = clui.separateArgs(tokens.slice(store.depth), string);
			let param = [...params, ...optional][separated.withSpace.params.length];
			flags = flags.filter(el => !separated.flags.includes(el.name));
	
			return [param, ...flags].filter(el => el !== undefined);
		} else { // filter used args
			let separated = clui.separateArgs(tokens.slice(store.depth), string);
			let param = [...params, ...optional].slice(0, separated.params.length);

			param.forEach((el, i) => {
				el.value = separated.params[i];
				if (el.type === 'string' && el.value[0].match(/["']/) !== null) el.value = el.value.slice(1, -1);
			});
			separated.flagData.forEach(el => {
				if (el.type === 'string') el.value = el.value.slice(1, -1);
			});

			return [...param, ...separated.flagData].filter(el => el !== undefined);
		}
	},
	/** separates arguments from tokens into flags and params */
	separateArgs: function(tokens: string[], string = ''): {flags: string[], flagData: types.Arg[],params: string[], withSpace: {flags: string[], params: string[]}} {
		let flags = [];
		let flagData = [];
		let params = [];
		let args = 0;
		let withSpace = {params: [], flags: []};

		for (let i = 0; i < tokens.length; i++) {
			let token = tokens[i];

			if (token.startsWith('-')) { // is flag
				if (token.match(/^(-)(\w)+/g) !== null) { // short flag "-f"
					flags.push(...token.split('').slice(1).map(el => current?.args?.find(el2 => el2.short === el)?.name));
					flagData.push(...token.split('').slice(1).map(el => {return {...current?.args?.find(el2 => el2.short === el), value: true}}));
				} else if (token.match(/^(--)(.)+/g) !== null) { // long flag "--flag"
					let arg = current?.args?.find(el => el.name === token.substr(2));
					if (arg === undefined) continue;

					if (arg?.type !== 'boolean') { // if not boolean
						flags.push(arg.name);
						flagData.push({...arg, value: tokens[i+1]});
						args++;
						i++;
					} else if (arg?.type === 'boolean') { // if boolean flag
						flags.push(arg.name);
						flagData.push({...arg, value: true});
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

		return {flags, params, withSpace, flagData};
	},
	/** sets the current command */
	setCurrent: function(name: string): void {
		if (Object.keys(current.commands).includes(name)) { // if command exists
			_current.update(val => current.commands[name]);
		} else {
			new Toast('setCurrent: Command has no children', 'yellow');
		}
	},
	/** tokenizes a cli input string */
	tokenize: function(input: string): string[] {
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