import path from 'path';
import convert from '../lib/converter';

import _git from './clui_one_command';
import _many from './clui_many_commands';
import { Command, Arg, default as CLUI } from '../clui';
import type * as types from '../clui';

const git = convert(_git);
const many = _many.map(el => convert(el));

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

	describe('getLastCommand', () => {
		it('get last command', () => {
			clui.load(git);

			expect(clui.getLastCommand([clui.commands[0]])).toEqual(git);
		});
		it('get last sub-command', () => {
			clui.load(git);
			let push = clui.commands[0].children[0];

			expect(clui.getLastCommand([clui.commands[0], push])).toEqual(push);
		});
		it('get last sub-command with commands and args as input', () => {
			clui.load(git);
			let push = clui.commands[0].children[0] as Command;
			let args = push.children as Arg[];

			expect(clui.getLastCommand([clui.commands[0], push, ...args])).toEqual(push);
		});
	});

	describe('stateful', () => {
    let stateful: types.stateful;

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