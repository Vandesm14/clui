import type { Command, Arg } from '../clui';

const push: Command = {
	name: 'push',
	description: 'push local changes to git remote [test]',
	type: 'arg',
	children: [
		{
			name: 'remote',
			description: 'the name of the remote to push changes to',
			required: true,
			type: 'string',
			mode: 'arg'
		},
		{
			name: 'branch',
			description: 'the name of the branch to push changes to',
			required: true,
			type: 'string',
			mode: 'arg'
		},
		{
			name: 'force',
			description: 'forces the push of unrelated histories',
			type: 'boolean',
			mode: 'opt'
		}
	],
  run: (ctx, args) => {
    ctx.done(true);
  }
};

const git: Command = {
	name: 'git',
	description: 'a simple git cli [test]',
	type: 'cmd',
	children: [push]
};

export default git;