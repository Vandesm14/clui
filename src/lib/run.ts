import clui, { Command, Arg, Tokens } from '../clui';
import parse from './parse';
import match from './match';

export function checkRun(this: clui, tokens: Tokens | string, internal?: boolean): boolean;
export function checkRun(this: clui, tokens: Tokens | string, internal: true): [boolean, Command?, Arg[]?];

export function checkRun(this: clui, tokens: Tokens | string, internal = false): any {
	if (typeof tokens === 'string') tokens = this.parse(tokens);
	const root = new Command({name: 'h', type: 'cmd', children: this.commands ?? []});

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
	type: 'string' | 'string_long' | 'number' | 'boolean' | 'enum' | 'button' | 'paragraph' | 'table',
	name: string,
	required?: boolean,
	description?: string,

	/** used by the runner to reference the arg */
	arg?: Arg,

	/** defines the keys to use for the table */
	columns?: (string | number)[],
	/** defines the values to use for the table */
	rows?: Record<string | number, string | number>[],

	value?: any,
	run?: () => void,
}

export class Request {
	args: Arg[];
	clui: clui;
	command: Command;

	constructor(args: Arg[], clui: clui, command: Command) {
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

export default async function run(this: clui, tokens: Tokens | string, response?: Response): Promise<{success: boolean, output: any}> {
	const [canRun, command, args] = checkRun.call(this, tokens, true);

	if (!command) return {success: false, output: 'Error: Missing command'};
	if (!canRun) return {success: false, output: 'Error: Missing required arguments'};

	const req = new Request(args, this, command);
	const res = response ?? new Response(console.log, console.log);

	if (command.run) {
		command.run(req, res);
		return {success: true, output: 'ok'};
	}
	else return {success: false, output: 'Error: Command has no run function'};
};