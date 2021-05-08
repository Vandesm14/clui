export interface storeMain {
	depth?: number,
	argDepth?:number,
	tokens?: string[],
	pages?: object[],
	toasts?: Toast[]
}

export interface Toast {
	msg: string,
	color: string
}

export interface Arg {
	name: string,
	description?: string,
	type: 'string' | 'boolean' | 'number' | 'enum',
	value?: string,
	short?: string,
	isArg?: true,
	required?: true,
}

export interface Command {
	description?: string,
	commands: Record<string, Command>,
	run: (gui: GUI, args: Arg[]) => void,
	args: Arg[]
}

export interface GUI {
	any
}