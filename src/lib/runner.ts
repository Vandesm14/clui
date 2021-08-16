import type * as types from '../clui.types';
import { Command, Arg, default as CLUI } from '../clui';
import parse from './parser';
import match from './matcher';

export function checkRun(root: CLUI | Command, tokens: (Command | Arg)[] | string, internal = false): boolean | [boolean, Command?, Arg[]?] {
	if (typeof tokens === 'string') tokens = match(root, parse(tokens));
	if (root instanceof CLUI) root = new Command({name: 'h', type: 'cmd', children: root.commands ?? []});

	let allRequired = false;
	let command = undefined;
	let args = undefined;

	if (tokens[0] instanceof Command || root instanceof Command) { // if token is a command
		let commands = tokens.filter(el => el instanceof Command);
		command = commands.length > 0  ? commands[commands.length - 1] as Command : root;
		args = tokens.filter(el => el instanceof Arg) as Arg[];

		if (command) {
			allRequired = true;
			if (command.type === 'arg' && command.children !== undefined) {
				let required = (command.children as Arg[]).filter((el: Arg) => el.required).length;
				allRequired = required === args.filter((el: Arg) => el.required).length;
			}
			if (!('run' in command)) allRequired = false;
		}
	}

	if (!internal) return allRequired;
	else return [allRequired, command, args];
};

export default function(root: CLUI | Command, tokens: (Command | Arg)[] | string) {
	const [canRun, command, args] = checkRun(root, tokens, true) as [boolean, Command?, Arg[]?];

	return new Promise<{success: boolean, output: any}>((resolve, reject) => {
		if (!command) resolve({success: false, output: 'Error: Missing command'});
		if (!canRun) resolve({success: false, output: 'Error: Missing required arguments'});

		const ctx: types.RunCtx = {
			command,
			done: (success, ...output) => {
				resolve({success, output});
			}
		};

		if (command.run) command.run(ctx, args);
		else resolve({success: false, output: 'Error: Command has no run function'});
	});
};