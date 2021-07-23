import convert from './lib/converter';
import parse from './lib/parser';
import match from './lib/matcher';
import run from './lib/runner';
import search from './lib/searcher';

import Fuse from 'fuse.js';

import type * as parser from './lib/parser';
import type * as searcher from './lib/searcher';
import type * as types from './clui.types';

export interface Command {
	name: string,
	description?: string,
	type?: 'cmd' | 'arg',
	children?: Command[] | Arg[],
	unknown?: boolean,
	run?: (ctx: types.RunCtx, args: Arg[]) => void,
	path?: Command[]
}

export class Command {
	constructor(obj: Command, recursive = true) {
		if (recursive) obj = convert(obj);
		Object.keys(obj).forEach(key => {
			// @ts-ignore
			this[key] = obj[key];
		});
	}
}

export interface Arg {
	name: string,
	description?: string,
	type: 'string' | 'number' | 'boolean',

	/** arg: a parameter (e.g. ls __~/Desktop__), opt: an option (e.g. __-a__ or __--flag param__) */
	mode?: 'arg' | 'opt',
	required?: boolean,
	unknown?: boolean,
	value?: any
}

export class Arg {
	constructor(obj: Arg) {
		this.name = obj.name;
		this.description = obj.description;
		this.type = obj.type;
		this.mode = obj.mode;
		this.required = obj.required;
		this.unknown = obj.unknown;
		this.value = obj.value;
	}
}

export default class CLUI {
	parse = parse;
	match = match;
	run = run;
	search = search;
	parseMatch = (str: string, root?: Command | CLUI) => match(root ?? this, parse(str));

	commands: Command[] = [];
	fuse = new Fuse(this.commands);

	load(...commands: Command[]) {
		for (let command of commands) {
			this.commands.push(new Command(command));
		}
		this.updateFuse();
	}

	async loadURL(url: string) {
		const result = (await import(url)).default;
		if (Array.isArray(result)) {
			for (let command of result) {
				this.commands.push(command);
			}
		} else {
			this.commands.push(result);
		}
		this.updateFuse();
	}

	getLastCommand(tokens: (Command | Arg)[]): Command | undefined {
		for (let i = tokens.length - 1; i >= 0; i--) {
			if (tokens[i] instanceof Command) return tokens[i] as Command;
		}
		return undefined;
	}

	updateFuse = () => {
		const flatten = (commands: Command[]): Command[] => {
			let result: Command[] = [];
			for (let command of commands) {
				result.push(command);
				if (command.type === 'cmd' && command.children) result = result.concat(flatten(command.children as Command[]));
			}
			return result;
		};
	
		let list = flatten(this.commands);
		const options = {
			keys: [
				'name',
				'description'
			]
		};
		this.fuse = new Fuse(list, options);
	}

	stateful(root?: Command) {
		if (root === undefined) root = new Command({name: 'h', type: 'cmd', children: this.commands ?? []});
		return {
			parse,
			match: (tokens: parser.Token[]) => match((root as Command), tokens),
			run: (tokens: (Command | Arg)[]) => run((root as Command), tokens),
			search: (query: string, opts?: searcher.options) => search((root as Command), query, opts)
		};
	}
};