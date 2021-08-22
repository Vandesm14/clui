import type { Command, Arg } from './clui';
import type { Request, Response } from './lib/runner';

const system: Command = {
	name: 'clui',
	description: 'the main system (so meta)',
	type: 'cmd',
	children: [
		{
			name: 'version',
			description: 'show the version',
			run: (req: Request, res: Response) => {
				res.out([
					{
						name: 'Version',
						type: 'string',
						value: `CLUI version ${req.clui.version}`,
					},
				]);
				res.status('ok');
			}
		},
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
			run: (req: Request, res: Response) => {
				const command = req.args[0];
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

const help = (system.children as Command[]).find((el: Command) => el.name === 'help');

const commands: Command[] = [
	system
];

export default commands;