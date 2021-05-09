import type clui from './clui';

export interface storeMain {
	depth?: number,
	argDepth?:number,
	divider?: number,
	tokens?: string[],
	pages?: object[],
	toasts?: Toast[],
	canRun?: boolean
}

export interface Toast {
	msg: string,
	color: string
}

export interface Arg {
	name: string,
	desc?: string,
	type: 'string' | 'boolean' | 'number' | 'enum' | 'button' | 'paragraph' | 'table',
	// value?: string | boolean | number | string[][],
	value?: any,
	short?: string,
	isArg?: true,
	required?: true,
	items?: Arg[],
	run?: () => void
}

export interface Command {
	desc?: string,
	commands?: Record<string, Command>,
	mode?: 'form' | 'toast',
	run?: (gui: typeof clui.Page | typeof clui.Toast, args: Arg[]) => void,
	args?: Arg[]
}