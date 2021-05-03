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

interface Arg {
	name: string,
	description?: string,
	type: 'string' | 'boolean' | 'number' | 'enum',
	short?: string,
	isArg?: true,
	required?: true,
}

export interface Command {
	description?: string,
	commands: Record<string, Command>,
	args: Arg[]
}