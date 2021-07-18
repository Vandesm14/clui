import parse from './lib/parser';
import match from './lib/match';
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

	loadURL(url: string) {

	}

	commands: types.Command[] = [];
};