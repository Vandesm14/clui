import parse from './lib/parser';
import match from './lib/matcher';
import convert from './lib/convert';
import type * as types from './clui.types';
import type { Command, Arg } from './clui.types';

export default class CLUI {
	parse = parse;
	match = match;
  parseMatch = (str: string) => match(this, parse(str))

	load(...commands: Command[]) {
		for (let command of commands) {
			this.commands.push(convert(command));
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

	commands: Command[] = [];
};