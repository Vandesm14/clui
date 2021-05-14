import type clui from './clui';

export interface storeMain {
	depth?: number,
	argDepth?:number,
	divider?: number,
	tokens?: string[],
	pages?: object[],
	toasts?: Toast[],
	canRun?: boolean,
	commands?: Record<string, Command>
}

export interface Toast {
	msg: string,
	id: string,
	color: string
}

export interface Arg {
	name: string,
	desc?: string,
	type: 'string' | 'boolean' | 'number' | 'enum' | 'button' | 'paragraph' | 'table',
	// value?: string | boolean | number | string[][],
	value?: any,
	short?: string,
	variant?: string,
	required?: boolean,
	items?: Arg[],
	run?: () => void
}

export interface Command {
	desc?: string,
	name?: string,
	commands?: Record<string, Command>,
	mode?: 'form' | 'toast',
	run?: (gui: typeof clui.Page | {Toast}, args: Arg[]) => void,
	args?: Arg[]
}