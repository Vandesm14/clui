import CLUI from '../clui';
import path from 'path';

import git from './clui_one_command';
import many from './clui_many_commands';

let clui: CLUI;

beforeEach(() => {
	clui = new CLUI(); // reset the CLUI instance
});

// TODO: Make it be a command type WITHOUT erroring out
const push: any = git.children[0];

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

	// TODO: Make the tests use hard-coded tokens instead of relying on the parser?
	describe('matcher', () => {
		it('match command', () => {
			clui.load(...many);

			many.forEach(command => {
				expect(clui.match(clui, clui.parse(command.name))).toEqual([command]);
			});
		});
		it('match sub-command', () => {
			clui.load(git);

			expect(clui.match(clui, clui.parse('git push'))).toEqual([git, push]);
		});
		it('match all tokens (cmd | arg)', () => {
			clui.load(git);

			expect(clui.match(clui, clui.parse("git push origin"))).toEqual([
        git,
        push,
        { ...push.children[0], value: "origin" },
      ]);
      expect(clui.match(clui, clui.parse("git push origin master"))
      ).toEqual([
        git,
        push,
        { ...push.children[0], value: "origin" },
        { ...push.children[1], value: "master" },
      ]);
      expect(clui.match(clui, clui.parse("git push origin master -f"))
      ).toEqual([
        git,
        push,
        { ...push.children[0], value: "origin" },
        { ...push.children[1], value: "master" },
        { ...push.children[2], value: true },
      ]);
		});
    it('unknown tokens', () => {
			clui.load(git);

      expect(clui.match(clui, clui.parse('git hello origin master -f'))).toEqual([
        git,
        { type: 'cmd', val: 'hello', unknown: true },
        { type: 'cmd', val: "origin", unknown: true },
        { type: 'cmd', val: "master", unknown: true },
        { type: 'opt', val: 'f', unknown: true },
      ]);
    });
	});
});