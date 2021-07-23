import test from './tests/clui_many_commands';
import type { Command, Arg } from './clui';

const commands: Command[] = [
	{
		name: 'clui',
		description: 'the main system (so meta)',
		type: 'cmd',
		children: [
			{
				name: 'help',
				description: 'get help with the CLUI',
				type: 'arg',
				children: [
					{
						name: 'command',
						description: 'the command to get help with',
						type: 'string'
					}
				],
				run: (ctx, args: Arg[]) => {
					const command = args[0];
					if (command) {

					} else {
					}
				}
			},
			{
				name: 'config',
				description: 'configure the CLUI',
				type: 'arg',
				children: [
					{
						name: 'option',
						description: 'the option to configure',
						type: 'string',
						required: true
					},
					{
						name: 'value',
						description: 'the value to set',
						type: 'string',
						required: true
					}
				]
			}
		]
	}
]

export default commands;