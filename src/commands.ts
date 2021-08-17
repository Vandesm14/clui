import type { Command, Arg } from './clui';

const clui: Command = {
	name: 'clui',
	description: 'the main system (so meta)',
	type: 'cmd',
	children: [
		{
			name: 'debug',
			description: 'debugging',
			type: 'cmd',
			children: [
				{
					name: 'log',
					description: 'logging',
				}
			]
		},
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
					// show help for the command
				} else {
					// show help for the system
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
};

const help = (clui.children as Command[]).find((el: Command) => el.name === 'help');

const commands: Command[] = [
	clui,
	// help
];

export default commands;