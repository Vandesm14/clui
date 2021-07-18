export type Command = CommandBase | CommandArgs | CommandCmd;

interface CommandBase {
	name: string,
	description?: string,
	type?: 'arg' | 'cmd',
	children?: Arg[] | Command[],
	run?: (ctx: RunCtx, args: Arg[]) => void
}

interface CommandArgs extends CommandBase {
	type: 'arg',
	children: Arg[];
}

interface CommandCmd extends CommandBase {
	type: 'cmd',
	children: Command[];
}

export interface Arg {
	name: string,
	type: string,
	mode: 'argument' | 'arg' | 'parameter' | 'param' | 'option' | 'opt',
	required?: boolean,
	description?: string,
	default?: any
}

export interface RunCtx {
	command: Command,
	toast: Toast,

	/** returns an instance of the given type */
	getContext: (type: string) => any,
}

export interface GUI {
	/** an array of the items in the GUI */
	items: GUI_Item[],

	/** initiates the GUI */
	init: () => void,

	/** appends a new item to the GUI */
	append: (...items: GUI_Item[]) => void,

	/** prepends a new item to the GUI */
	prepend: (...items: GUI_Item[]) => void,

	/** removes an item from the GUI */
	remove: (index: number) => void,

	/** clears all items from the GUI */
	clear: () => void,

	/** destroys the GUI */
	destroy: () => void,

	/** selects an item via index and returns it */
	select: (index: number) => GUI_Item,

	/** used to force-redraw the GUI (example: a TUI or API) */
	redraw: () => void,
}

export interface GUI_Item {
	type: 'string' | 'string_long' | 'number' | 'boolean' | 'enum' | 'button' | 'paragraph',
	name: string,
	value?: any,
}

export interface Toast {

}