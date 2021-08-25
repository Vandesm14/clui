import type { Command, Arg } from './clui';
import type { Request, Response } from './lib/runner';
import clui_many_commands from './tests/clui_many_commands';

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
						type: 'paragraph',
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
					type: 'string',
					required: true
				}
			],
			run: (req: Request, res: Response) => {
				const command = req.args[0];
				if (command) {
					const query = req.clui.search(req.clui, command.value, {withPath: true});
					if (query.length) {
						const first = query[0];
						res.out([
								{
								name: first.name,
								type: 'paragraph',
								value: `Description: ${first.description}\n`+
								`Children: ${first.children?.length ?? 0} (${first.type ?? 'N/A'})\n`+
								`Path: ${first.path.map(el => el.name).join(' > ')}`
							},
							{
								name: 'Arguments',
								type: 'table',
								value: first.children?.map(el => ({
									name: el.name,
									type: el.type,
									description: el.description
								}))
							},
							{
								name: 'Run',
								type: 'button',
								value: 'Run',
								run: () => {
									req.clui.run(req.clui, [first]);
								}
							}
						]);
						res.status('ok');
					} else {
						res.out([{
							name: 'Error',
							type: 'paragraph',
							value: `No command found for "${command.value}"`
						}]);
						res.status('error');
					}
				} else {
					res.out([{
						name: 'CLUI',
						type: 'paragraph',
						value: 'The CLUI is a unified command system for the web',
					}]);
					res.status('ok');
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

const commands: Command[] = [
	system
];

export default commands;