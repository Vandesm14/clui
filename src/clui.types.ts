// export type Command = CommandEmpty | CommandArgs | CommandCmd;

// interface CommandBase {
// 	name: string,
// 	description?: string,
// 	run?: (ctx: RunCtx, args: Arg[]) => void
// }

// interface CommandEmpty extends CommandBase {
// 	type?: undefined,
// 	children?: undefined
// }

// interface CommandArgs extends CommandBase {
// 	type: 'arg',
// 	children?: Arg[];
// }

// interface CommandCmd extends CommandBase {
// 	type: 'cmd',
// 	children?: Command[];
// }

export interface Command {
	name: string,
	description?: string,
	type?: 'cmd' | 'arg',
	children?: Command[] | Arg[],
	run?: (ctx: RunCtx, args: Arg[]) => void
}

export class Command {
	constructor(obj: Command) {
		this.name = obj.name;
		this.description = obj.description;
		this.type = obj.type;
		this.children = obj.children;
		this.run = obj.run;
	}
}

export interface Arg {
	name: string,
	description?: string,
	type: 'string' | 'number' | 'boolean',

	/** arg: a parameter (e.g. ls __~/Desktop__), opt: an option (e.g. __-a__ or __--flag param__) */
	mode?: 'arg' | 'opt',
	required?: boolean,
	default?: any
}

export class Arg {
	constructor(obj: Arg) {
		this.name = obj.name;
		this.description = obj.description;
		this.type = obj.type;
		this.mode = obj.mode;
		this.required = obj.required;
		this.default = obj.default;
	}
}

export interface RunCtx {
	command: Command,
	finish: (success: boolean, ...output: any[]) => void,

	/** returns an instance of the given type */
	output: Output
}

export interface Output {
	/** an array of the items in the Output */
	items: OutputItem[],

	/** initiates the Output */
	init: () => void,

	/** destroys the Output */
	destroy: () => void,
}

export interface OutputItem {
	type: 'string' | 'string_long' | 'number' | 'boolean' | 'enum' | 'button' | 'paragraph',
	name: string,
	value?: any,
}