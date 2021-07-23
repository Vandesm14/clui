import convert from './lib/converter';
import parse from './lib/parser';
import match from './lib/matcher';
import run from './lib/runner';
import search from './lib/searcher';

import type * as parser from './lib/parser';
import type * as types from './clui.types';

export interface Command {
	name: string,
	description?: string,
	type?: 'cmd' | 'arg',
	children?: Command[] | Arg[],
	run?: (ctx: types.RunCtx, args: Arg[]) => void
}

export class Command {
	constructor(obj: Command, recursive = true) {
		if (recursive) obj = convert(obj);
		Object.keys(obj).forEach(key => {
			// @ts-expect-error
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
	value?: any
}

export class Arg {
	constructor(obj: Arg) {
		this.name = obj.name;
		this.description = obj.description;
		this.type = obj.type;
		this.mode = obj.mode;
		this.required = obj.required;
		this.value = obj.value;
	}
}

export default class CLUI {
	parse = parse;
	match = match;
	parseMatch = (str: string, root?: Command | CLUI) => match(root ?? this, parse(str))

	load(...commands: Command[]) {
		for (let command of commands) {
			this.commands.push(new Command(command));
		}
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
	}

	stateful(root?: Command) {
		if (root === undefined) root = new Command({name: 'h', type: 'cmd', children: this.commands ?? []});
		return {
			parse,
			match: (tokens: parser.Token[]) => match((root as Command), tokens),
			run: (tokens: (Command | Arg)[]) => run((root as Command), tokens),
			search: (query: string) => search((root as Command), query)
		};
	}

	commands: Command[] = [];
};