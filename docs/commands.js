const arg = clui.arg;

const commands = {
	'help': {
		desc: 'get help with the CLUI',
		args: [
			arg('command', 'get help with a specific command', 'string', {isArg: true})
		],
		run: (gui, args) => {
			gui.close();
			if (args[0]?.value) {
				// if (clui.commands[args[0].value]) {
				// 	gui.append({type: 'paragraph', name: args[0].value, value: clui.commands[args[0].value].desc});
				// 	gui.append({type: 'button', value: 'Run Command', run: () => {
				// 		clui.clear();
				// 		clui.execute(clui.commands[args[0].value]);
				// 		gui.close();
				// 	}});
				// } else {
				// 	gui.append({type: 'paragraph', value: `Command "${args[0].value}" does not exist`});
				// }
				new gui.Toast('Not yet implemented', 'yellow');
			} else {
				gui.append({type: 'paragraph', name: 'About', value: `
				The CLUI is a unified command system for the web. The CLUI has the speed of a CLI while having the convenience of a UI.
				
				Instead of fumbling through CLI documentation, spend more time running commands by using the CLUI\'s integrated form system to easily understand and fill out parameters and arguments. Adding a reactive command line to your website is as easy as including a plugin and adding commands!
				
				More Info: <a target="_blank" href="https://clui.respdev.com">https://clui.respdev.com</a>
				`.trim()});
			}
		}
	},
	'test': {
		desc: 'tests a specific subsystem',
		commands: {
			'cli': {
				desc: 'tests the cli parser and components',
				args: [
					arg('string', 'either a single word or a multi-word string using quotes', 'string',	{required: true}),
					arg('number', 'either an integer or a float', 'number',	{required: true}),
					arg('optional', 'a boolean value: true or false', 'boolean', {isArg: true}),
					arg('flag', 'a small boolean flag', 'boolean', {short: 'f'}),
					arg('flag-string', 'a flag with a single argument', 'string'),
					arg('flag-enum', 'a flag with a enum argument', 'enum', {items: [
						arg('a', 'the first option'),
						arg('b', 'the second option'),
						arg('c', 'the third option')
					]})
				],
				run: (gui, args) => {
					gui.render([{name: 'Success!', value: `The CLI works!
					String: ${args.find(el => el.name === 'string').value}
					Number: ${args.find(el => el.name === 'number').value}`, type: 'paragraph'}]);
					gui.append({type: 'string', name: 'Your Name', required: true});
					gui.append({type: 'button', value: 'Submit', run: () => {
						new gui.Toast(`Hello, ${gui.list().find(el => el.name === 'Your Name').value}`);
						gui.render([
							{type: 'button', value: 'Reset', run: gui.reset},
							{type: 'button', value: 'Close', run: gui.close}
						])
					}});
				}
			}
		}
	},
	'test-cli': {
		desc: 'tests the cli parser and components',
		args: [
			arg('string', 'either a single word or a multi-word string using quotes', 'string',	{required: true}),
			arg('number', 'either an integer or a float', 'number',	{required: true}),
			arg('optional', 'a boolean value: true or false', 'boolean', {isArg: true}),
			arg('flag', 'a small boolean flag', 'boolean', {short: 'f'}),
			arg('flag-string', 'a flag with a single argument', 'string'),
			arg('flag-enum', 'a flag with a enum argument', 'enum', {items: [
				arg('a', 'the first option'),
				arg('b', 'the second option'),
				arg('c', 'the third option')
			]})
		],
		run: (gui, args) => {
			gui.render([{name: 'Success!', value: `The CLI works!
			String: ${args.find(el => el.name === 'string').value}
			Number: ${args.find(el => el.name === 'number').value}`, type: 'paragraph'}]);
			gui.append({type: 'string', name: 'Your Name', required: true});
			gui.append({type: 'button', value: 'Submit', run: () => {
				new gui.Toast(`Hello, ${gui.list().find(el => el.name === 'Your Name').value}`);
				gui.render([
					{type: 'button', value: 'Reset', run: gui.reset},
					{type: 'button', value: 'Close', run: gui.close}
				])
			}});
		}
	},
	'git': {
		desc: 'a simple git cli',
		commands: {
			'push': {
				desc: 'push local changes to remote',
				args: [
					arg('remote', 'the name of the remote to push to', 'string', {required: true}),
					arg('branch', 'the name of the branch to push to', 'string', {required: true}),
					arg('force', 'overwrite remote state with local state', 'boolean', {short: 'f'})
				]
			},
			'remote': {
				desc: 'modify the remote list',
				commands: {
					'add': {
						desc: 'add a remote to the local repository',
						args: [
							arg('name', 'the name for the new remote', 'string', {required: true}),
							arg('url', 'the url of the new remote', 'string', {required: true})
						]
					},
					'remove': {
						desc: 'add a remote to the local repository',
						args: [
							arg('name', 'the name of the remote to remove', 'string', {required: true})
						]
					}
				}
			}
		}
	}
};

clui.load(commands);