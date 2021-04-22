const commands = {
	'test': {
		description: 'tests a specific subsystem',
		commands: {
			'cli': {
				description: 'tests the cli parser and components',
				args: [{
						name: 'string',
						description: 'either a single word or a multi-word string using quotes',
						type: 'string',
						required: true
					},
					{
						name: 'number',
						description: 'either an integer or a float',
						type: ['integer', 'float'],
						required: true
					},
					{
						name: 'optional',
						description: 'a boolean value: true or false',
						type: 'boolean',
						// required is inferred as false
						isArg: true
						// argument is forced to be an arg, not a flag
					},
					{
						name: ['flag', 'f'],
						description: 'a small boolean flag',
						type: 'boolean'
						// required is inferred as false
						// argument is inferred as a flag (--flag or -f)
					},
					{
						name: 'flag-string',
						description: 'a flag with a single argument',
						type: 'string'
						// required is inferred as false
						// argument is inferred as a flag (--flag or -f)
					}
				],
				run: (args, state, gui) => {
					console.log(args, state, gui);
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
				args: [{
						name: 'remote',
						description: 'the name of the remote to push to',
						type: 'string',
						required: true
					},
					{
						name: 'branch',
						description: 'the name of the branch to push to',
						type: 'string',
						required: true
					},
					{
						name: ['force', 'f'],
						description: 'overwrite remote state with local state',
						type: 'boolean',
					}
				]
			},
			'remote': {
				description: 'modify the remote list',
				commands: {
					'add': {
						description: 'add a remote to the local repository',
						args: [{
								name: 'name',
								description: 'the name for the new remote',
								type: 'string',
								required: true
							},
							{
								name: 'url',
								description: 'the url of the new remote',
								type: 'string',
								required: true
							}
						]
					},
					'remove': {
						description: 'add a remote to the local repository',
						args: [{
							name: 'name',
							description: 'the name of the remote to remove',
							type: 'string',
							required: true
						}]
					}
				}
			}
		}
	}
};