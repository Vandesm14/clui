import CLUI from '../clui';
import type * as types from '../command.types';
import path from 'path';
import { command } from 'yargs';

import git from './clui_one_command';
import many from './clui_many_commands';

let clui: CLUI;

beforeEach(() => {
	clui = new CLUI(); // reset the CLUI instance
});

// TODO: Make it be a command type WITHOUT erroring out
const push: any = git.children[0];

// TODO: Refactor tests to use the git object
describe('clui', () => {
	describe('load', () => {
		it('load one command', () => {
			clui.load(git);
			expect(clui.commands.find(el => el.name === git.name)).toEqual(git);
			expect(clui.commands[0]).toEqual(git);
		});
		it('load multiple commands', () => {
			clui.load(...many);
			
			many.forEach(command => {
				expect(clui.commands.find(el => el.name === command.name)).toEqual(command);
			});
			expect(clui.commands).toEqual(many);
		});
		it('load a command via URL', async () => { // TODO: Figure out how to export commands via file
			await clui.loadURL(path.resolve(__dirname, './clui_one_command'));
			expect(clui.commands.find(el => el.name === git.name)).toEqual(git);
			expect(clui.commands[0]).toEqual(git);
		});
		it('load multiple commands via URL', async () => { // TODO: Figure out how to export commands via file
			await clui.loadURL(path.resolve(__dirname, './clui_many_commands'));

			many.forEach(command => {
				expect(clui.commands.find(el => el.name === command.name)).toEqual(command);
			});
			expect(clui.commands).toEqual(many);
		});
	});

	// TODO: Make the tests use hard-coded tokens instead of relying on the parser?
	describe('match', () => {
		it('match command', () => {
			clui.load(...many);

			many.forEach(command => {
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