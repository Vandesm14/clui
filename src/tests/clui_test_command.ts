import type { Command, Arg } from '../clui.types';

const test: Command = {
	name: 'test',
	description: 'an internal command to test the clui',
	type: 'arg',
	children: [
		{
			name: 'param',
			type: 'string',
			mode: 'arg'
		}
	],
	run: (ctx, args) => {
		ctx.finish(true, args);
	}
};

export default test;