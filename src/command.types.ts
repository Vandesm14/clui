export type Command = CommandBase | CommandArgs | CommandCmd;

interface CommandBase {
	name: string,
	description?: string,
	run?: (ctx: RunCtx, args: Arg[]) => void
}

interface CommandArgs extends CommandBase {
	type: 'args',
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
	gui: GUI
}

export interface GUI {
	items: GUI_Item[],
	append: (...items: GUI_Item[]) => void,
	prepend: (...items: GUI_Item[]) => void,
	clear: () => void,
	select: (index: number) => GUI_Item,
	remove: (index: number) => void,
}

export interface GUI_Item {

}

export interface Toast {

}