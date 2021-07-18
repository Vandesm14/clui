import parser from './lib/parser';
import type * as types from './command.types';

export default class CLUI {
	constructor(commands?: []) {
		
	}

	load(...commands: types.Command[]) {
		for (let command of commands) {
			this.commands.set(command.name, command);
		}
	}

	loadURL(url: string) {

	}

	commands: Map<string, types.Command> = new Map();

	get commandsArr() {
		return Array.from(this.commands.values());
	}
};