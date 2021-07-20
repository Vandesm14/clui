export type Command = CommandEmpty | CommandArgs | CommandCmd;

interface CommandBase {
	name: string,
	description?: string,
	run?: (ctx: RunCtx, args: Arg[]) => void
}

interface CommandEmpty extends CommandBase {
	type?: undefined,
	children?: undefined
}

interface CommandArgs extends CommandBase {
	type: 'arg',
	children?: Arg[];
}

interface CommandCmd extends CommandBase {
	type: 'cmd',
	children?: Command[];
}

export interface Arg {
	name: string,
	type: 'string' | 'number' | 'boolean',

	/** arg: a parameter (e.g. `ls __~/Desktop__`), opt: an option (e.g. `-a` or `--flag param`) */
	mode?: 'arg' | 'opt',
	required?: boolean,
	description?: string,
	default?: any
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