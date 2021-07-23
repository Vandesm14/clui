import type * as types from '../clui.types';
import { Command, Arg, default as CLUI } from '../clui';
import parse from './parser';
import match from './matcher';

export default function(root: CLUI | Command, tokens: (Command | Arg)[] | string) {
	if (typeof tokens === 'string') tokens = match(root, parse(tokens));
	if (root instanceof CLUI) root = new Command({name: 'h', type: 'cmd', children: root.commands ?? []});

	if (tokens[0] instanceof Command || root instanceof Command) { // if token is a command
		let commands = tokens.filter(el => el instanceof Command);
		const command = commands.length > 0  ? commands[commands.length - 1] as Command : root;
		let args = tokens.filter(el => el instanceof Arg) as Arg[];

		if (command) {
			let allRequired = true;
			if (command.type === 'arg' && command.children !== undefined) {
				let required = (command.children as Arg[]).filter((el: Arg) => el.required).length;
				allRequired = required === args.filter((el: Arg) => el.required).length;
			}

			return new Promise<{success: boolean, output: any}>((resolve, reject) => {
				if (!allRequired) resolve({success: false, output: 'Error: Missing required arguments'});

				const ctx: types.RunCtx = {
					command,
					done: (success, ...output) => {
						resolve({success, output});
					}
				};

				if (command.run) command.run(ctx, args);
				else resolve({success: false, output: 'Error: Command has no run function'});
			});
		} else {
			// TODO: reject
		}
	}
};