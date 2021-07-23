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
});