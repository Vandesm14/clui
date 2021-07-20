import parse from './lib/parser';
import match from './lib/matcher';
import type * as types from './clui.types';
import { Command, Arg } from './clui.types';

export default class CLUI {
	parse = parse;
	match = match;

	load(...commands: types.Command[]) {
		const convert = (cmd: types.Command) => {
			cmd = new Command(cmd);

			if (cmd.children && cmd.type === 'cmd') {
				let list = [];
				for (let item of cmd.children) {
					list.push(convert(item as types.Command));
				}
				cmd.children = list;
			} else if (cmd.children && cmd.type === 'arg') {
				let list = [];
				for (let item of cmd.children) {
					list.push(new Arg(item as types.Arg));
				}
				cmd.children = list;
			}

			return cmd;
		};

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

	commands: types.Command[] = [];
};