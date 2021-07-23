import path from 'path';

import git from './clui_one_command';
import many from './clui_many_commands';

import { Command, Arg, default as CLUI } from '../clui';

let clui: CLUI;

beforeEach(() => {
	clui = new CLUI(); // reset the CLUI instance
});

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
		it('load a command via URL', async () => {
			await clui.loadURL(path.resolve(__dirname, './clui_one_command'));

			expect(clui.commands.find(el => el.name === git.name)).toEqual(git);
			expect(clui.commands[0]).toEqual(git);
		});
		it('load multiple commands via URL', async () => {
			await clui.loadURL(path.resolve(__dirname, './clui_many_commands'));

			many.forEach(command => {
				expect(clui.commands.find(el => el.name === command.name)).toEqual(command);
			});
			expect(clui.commands).toEqual(many);
		});
	});

	describe('stateful', () => {
		let stateful;

		beforeEach(() => {
			clui.load(git);
			stateful = clui.stateful();
		});

		it('parse', () => {
			expect(stateful.parse('git')).toEqual([{type: 'cmd', val: 'git'}]);
		});
		it('match', () => {
			expect(stateful.match(stateful.parse('git'))).toEqual([git]);
		});
		it('run', async () => {
			const result = await stateful.run([
				new Command(git),
				new Command(git.children[0] as Command)]);
			expect(result.success).toBe(false);
			expect(result.output).toBe('Error: Missing required arguments');
		});
		it('search', () => {
			expect(stateful.search('a simple git')).toEqual([git]);
		});
	});
});