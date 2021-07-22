export interface RunCtx {
	command: Command,
	done: (success: boolean, ...output: any[]) => void,

	/** returns an instance of the given type */
	// output: Output
}

// export class RunCtx {
//   constructor(command: Command, done: RunCtx['done']) {
    
//   }
// }

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