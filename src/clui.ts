import parse from './lib/parser';
import match from './lib/matcher';
import type * as types from './command.types';

export default class CLUI {
	constructor(commands?: []) {
		
	}

	parse = parse;
	match = match;

	load(...commands: types.Command[]) {
		for (let command of commands) {
			this.commands.push(command);
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

	commands: types.Command[] = [];
};