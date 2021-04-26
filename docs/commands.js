const arg = (name, description, type, options) => {
	return {name, description, type, ...options};
};

const commands = {
	'help': {
		description: 'get help with the CLUI',
		commands: {
			'about': {
				description: 'print an about page'
			}
		}
	},
	'test': {
		description: 'tests a specific subsystem',
		commands: {
			'cli': {
				description: 'tests the cli parser and components',
				args: [
					arg('string', 'either a single word or a multi-word string using quotes', 'string',	{required: true}),
					arg('number', 'either an integer or a float', ['integer', 'float'],	{required: true}),
					arg('optional', 'a boolean value: true or false', 'boolean', {isArg: true}),
					arg('flag', 'a small boolean flag', 'boolean', {short: 'f'}),
					arg('flag-string', 'a flag with a single argument', 'string'),
					arg('flag-enum', 'a flag with a enum argument', 'enum')
				],
				run: (gui, args) => {
					console.log({gui, args});
					// gui.render(args); // renders the args onto the GUI page
				}
			}
		}
	},
	'git': {
		description: 'a simple git cli',
		commands: {
			'push': {
				description: 'push local changes to remote',
				args: [
					arg('remote', 'the name of the remote to push to', 'string', {required: true}),
					arg('branch', 'the name of the branch to push to', 'string', {required: true}),
					arg('force', 'overwrite remote state with local state', 'boolean', {short: 'f'})
				]
			},
			'remote': {
				description: 'modify the remote list',
				commands: {
					'add': {
						description: 'add a remote to the local repository',
						args: [
							arg('name', 'the name for the new remote', 'string', {required: true}),
							arg('url', 'the url of the new remote', 'string', {required: true})
						]
					},
					'remove': {
						description: 'add a remote to the local repository',
						args: [
							arg('name', 'the name of the remote to remove', 'string', {required: true})
						]
					}
				}
			}
		}
	}
};