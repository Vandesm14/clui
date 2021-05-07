clui.commands = {
	'parser-test': {
		description: 'tests the parser',
		inputs: [{
				name: 'string',
				description: 'a random string to test',
				type: 'string',
				mode: 'param',
			},
			{
				name: 'number',
				description: 'a random number (float) to test',
				type: 'number',
				mode: 'param',
			},
			{
				name: 'option',
				description: 'a option for testing (string)',
				type: 'string',
				mode: 'option',
			}
		],
		run: (input) => {
			return {
				page: [{
					name: 'Echo!',
					type: 'label',
					description: input.text
				}]
			};
		}
	},
	'echo': {
		description: 'echos the inputted message',
		inputs: [{
			name: 'text',
			description: 'the text to echo',
			type: 'string',
			mode: 'param',
		}],
		run: (input) => {
			return {
				page: [{
					name: 'Echo!',
					type: 'label',
					description: input.text
				}]
			};
		}
	},
	'git': {
		description: 'a simple git cli',
		commands: {
			'push': {
				description: 'update remote refs along with associated objects',
				inputs: [{
						name: 'repository',
						type: 'string',
						mode: 'param',
						default: 'origin',
						description: 'target repository or remote'
					},
					{
						name: 'branch',
						type: 'string',
						mode: 'param',
						default: 'master',
						description: 'target branch'
					},
					{
						name: 'options',
						type: 'label',
						description: 'or "flags"'
					},
					{
						name: 'force',
						type: 'boolean',
						mode: 'option',
						description: 'disable saftey checks',
						short: 'f'
					}
				],
				run: (input) => {
					return {
						page: [{
							name: 'Succes!',
							type: 'label',
							description: 'All refs pushed successfully to remote'
						}]
					};
				}
			},
			'remote': {
				description: 'manage remote',
				commands: {
					'add': {
						description: 'add a remote',
						inputs: [{
								name: 'name',
								type: 'string',
								mode: 'param',
								default: 'origin',
								description: 'name of remote'
							},
							{
								name: 'url',
								type: 'string',
								mode: 'param',
								description: 'url of remote'
							}
						]
					},
					'remove': {
						description: 'remove a remote',
						inputs: [{
							name: 'name',
							type: 'string',
							mode: 'param',
							description: 'name of remote'
						}]
					}
				}
			}
		}
	},
	'moderator': {},
	'test': {
		description: 'tests output rendering',
		run: (input) => {
			return {
				page: [{
						name: 'Tables',
						type: 'label',
						description: 'The table below should be rendered correctly'
					},
					{
						name: 'Table',
						type: 'table',
						data: [{
								'user': 'john',
								'desktop': true
							},
							{
								'user': 'alice',
								'desktop': true
							},
							{
								'user': 'john',
								'desktop': true
							},
							{
								'user': 'bob',
								'desktop': true
							},
							{
								'user': 'bob',
								'desktop': true
							},
							{
								'user': 'bob',
								'desktop': true,
								'keyring': 7
							},
							{
								'user': 'alice',
								'desktop': true
							},
							{
								'user': 'alice',
								'keyring': 16
							},
							{
								'user': 'james',
								'desktop': true
							},
							{
								'user': 'dawson',
								'desktop': true
							}
						]
					},
					{
						name: 'Groups',
						type: 'label',
						description: 'The button2 and label should be grouped in a row'
					},
					{
						type: 'group',
						data: [{
								name: 'prev',
								type: 'button',
								run: () => {},
								group: 'pageing'
							},
							{
								type: 'label',
								description: 'Page 1 of 2',
								group: 'pageing'
							},
							{
								name: 'next',
								type: 'button',
								run: () => {},
								group: 'pageing'
							}
						]
					}
				]
			};
		}
	}
};