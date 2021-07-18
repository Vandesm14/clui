import CLUI from '../clui';
import type * as types from '../command.types';

let clui: CLUI;

beforeEach(() => {
	clui = new CLUI(); // reset the CLUI instance
});

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

// TODO: Refactor tests to use the git object

describe('clui', () => {
	describe('load', () => {
		it('load one command', () => {
			clui.load({name: 'git'});
			expect(clui.commands.find(el => el.name === 'git')).toEqual({name: 'git'});
		});
		it('load multiple commands', () => {
			const commands = [{name: 'git'}, {name: 'npm'}, {name: 'bower'}];
			clui.load(...commands);
			
			commands.forEach(command => {
				expect(clui.commands.find(el => el.name === command.name)).toEqual(command);
			});
			expect(clui.commands).toEqual(commands);
		});
		it.skip('load commands via URL', () => { // TODO: Figure out how to export commands via file
			clui.loadURL('../test_commands.js');
			expect(clui.commands.find(el => el.name === 'git')).toEqual({name: 'git'});
		});
	});

	describe('match', () => {
		it('match command', () => {
			const commands = [{name: 'git'}, {name: 'npm'}, {name: 'bower'}];
			clui.load(...commands);

			commands.forEach(command => {
				expect(clui.match(clui, clui.parse(command.name))).toEqual(command);
			});
		});
		it('match sub-command', () => {
			clui.load(git);

			expect(clui.match(clui, clui.parse('git push'))).toEqual(push);
		});
		it('match all tokens (cmd | arg)', () => {
			clui.load(git);

			expect(clui.match(clui, clui.parse('git push origin'), true)).toEqual([git, push, push.children[0]]);
			expect(clui.match(clui, clui.parse('git push origin master'), true)).toEqual([git, push, push.children[0], push.children[1]]);
			expect(clui.match(clui, clui.parse('git push origin master -f'), true)).toEqual([git, push, push.children[0], push.children[1], push.children[2]]);
		});
	});
});