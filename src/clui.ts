import parse from './lib/parser';
import match from './lib/matcher';
import type * as types from './clui.types';

export default class CLUI {
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