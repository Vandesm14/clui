import CLUI from '../clui';
import path from 'path';

import git from './clui_one_command';
import many from './clui_many_commands';

import { Command, Arg } from '../clui';

let clui: CLUI;

beforeEach(() => {
	clui = new CLUI(); // reset the CLUI instance
});

const push: Command = (git.children[0] as Command);

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

	describe('parser & matcher (parseMatch)', () => {
		beforeEach(() => {
			clui = new CLUI(); // reset the CLUI instance
			clui.load(git);
		});
		it('match a command', () => {
			expect(clui.parseMatch('git')).toEqual([git]);
		});
		it('match a sub-command', () => {
			expect(clui.parseMatch('git push')).toEqual([git, push]);
		});
		it('match all tokens (cmd | arg)', () => {
			expect(clui.parseMatch('git push origin'))
      .toEqual([
        git,
        push,
        { ...push.children[0], value: 'origin' },
      ]);
      expect(clui.parseMatch('git push origin master'))
      .toEqual([
        git,
        push,
        { ...push.children[0], value: 'origin' },
        { ...push.children[1], value: 'master' },
      ]);
      expect(clui.parseMatch('git push origin master -f'))
      .toEqual([
        git,
        push,
        { ...push.children[0], value: 'origin' },
        { ...push.children[1], value: 'master' },
        { ...push.children[2], value: true },
      ]);
		});
    it('match & return unknown tokens', () => {
      expect(clui.parseMatch('git hello origin master -f'))
      .toEqual([
        git,
        { type: 'cmd', val: 'hello', unknown: true },
        { type: 'cmd', val: 'origin', unknown: true },
        { type: 'cmd', val: 'master', unknown: true },
        { type: 'opt', val: 'f', unknown: true },
      ]);
    });
		it('match tokens with custom root element', () => {
			expect(clui.parseMatch('push origin', new Command(git)))
      .toEqual([
        push,
        { ...push.children[0], value: 'origin' },
      ]);
      expect(clui.parseMatch('origin master', new Command(push)))
      .toEqual([
        { ...push.children[0], value: 'origin' },
        { ...push.children[1], value: 'master' },
      ]);
		});
		it('invalid root type', () => {
			// @ts-expect-error
      expect(() => clui.match({}, clui.parse(''))).toThrow('Invalid root type (root has to be a Command)');
		});
		it('command.children is undefined', () => {
			// @ts-expect-error
      expect(clui.match(new Command({}), clui.parse('git push origin master'))).toEqual([]);
		});
	});
});