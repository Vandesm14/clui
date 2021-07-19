import type * as types from '../command.types';

const push: types.Command = {
	name: 'push',
	description: 'push local changes to remote',
	type: 'arg',
	children: [
		{
			name: 'remote',
			description: 'the name of the remote to push changes to',
			type: 'string',
			mode: 'arg'
		},
		{
			name: 'branch',
			description: 'the name of the branch to push changes to',
			type: 'string',
			mode: 'arg'
		},
		{
			name: 'force',
			description: 'forces the push of unrelated histories',
			type: 'boolean',
			mode: 'opt'
		}
	]
};

const git: types.Command = {
	name: 'git',
	description: 'a simple git cli',
	type: 'cmd',
	children: [push]
};

export default [git, {name: 'npm'}, {name: 'node'}];