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
	desc?: string,
	type: 'string' | 'boolean' | 'number' | 'enum' | 'button' | 'paragraph' | 'table',
	value?: string,
	short?: string,
	isArg?: true,
	required?: true,
	run?: () => void
}

// export interface Item {
// 	name?: string,
// 	value: string,
// 	desc?: string,
// 	type: 'button' | 'paragraph' | 'table',
// 	run?: () => void
// }

export interface Command {
	desc?: string,
	commands?: Record<string, Command>,
	run?: (gui: GUI, args: Arg[]) => void,
	args?: Arg[]
}

export interface GUI {
	any
}