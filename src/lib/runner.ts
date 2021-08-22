import { Command, Arg, default as CLUI } from '../clui';
import parse from './parser';
import match from './matcher';

export function checkRun(root: CLUI | Command, tokens: (Command | Arg)[] | string, internal?: boolean): boolean;
export function checkRun(root: CLUI | Command, tokens: (Command | Arg)[] | string, internal: true): [boolean, Command?, Arg[]?];

export function checkRun(root: CLUI | Command, tokens: (Command | Arg)[] | string, internal = false): any {
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
			allRequired = 'run' in command;
			if (command.type === 'arg' && command.children !== undefined) {
				let required = (command.children as Arg[]).filter((el: Arg) => el.required).length;
				allRequired = required === args.filter((el: Arg) => el.required).length;
			}
		}
	}

	if (!internal) return allRequired;
	else return [allRequired, command, args];
};

export interface OutputItem {
	type: 'string' | 'string_long' | 'number' | 'boolean' | 'enum' | 'button' | 'paragraph',
	name: string,
	value?: any,
}

export class Request {
	args: Arg[];
	clui: CLUI;
	command: Command;

	constructor(args: Arg[], clui: CLUI, command: Command) {
		this.args = args;
		this.clui = clui;
		this.command = command;
	}
}

export class Response {
	out: (items: OutputItem[]) => void;
	status: (status: 'ok' | 'err' | string) => void;

	constructor(out: Response['out'], status: Response['status']) {
		this.out = out;
		this.status = status;
	}
}

/*
	const git = clui.search('git')[0];
	clui.run(git, 'push origin master', handler);
*/

export default function run(clui: CLUI, root: CLUI | Command, tokens: (Command | Arg)[] | string) {
	const [canRun, command, args] = checkRun(root, tokens, true);

	return new Promise<{success: boolean, output: any}>((resolve, reject) => {
		if (!command) resolve({success: false, output: 'Error: Missing command'});
		if (!canRun) resolve({success: false, output: 'Error: Missing required arguments'});

		const req = new Request(args, clui, command);
		const res = new Response(() => console.log, () => console.log);

		if (command.run) {
			command.run(req, res);
			resolve({success: true, output: 'ok'});
		}
		else resolve({success: false, output: 'Error: Command has no run function'});
	});
};