import convert from '../lib/converter';
import search from '../lib/searcher';

import { Command, Arg, default as CLUI } from '../clui';

import _git from './clui_one_command';

const git = convert(_git);
const push: any = git.children[0];

const clui = new CLUI();
clui.load(git);

const commands = new Command({name: 'h', type: 'cmd', children: [git]});

describe('searcher', () => {
	it('find a command by name', () => {
    expect(search(clui, 'git')).toEqual([git, push]);
	});
	it('find a sub-command by name', () => {
    expect(search(git, 'push')).toEqual([push]);
	});
	it('find a command by description', () => {
    expect(search(clui, 'a simple git cli')).toEqual([git]);
	});
	it('find a sub-command by description', () => {
		expect(search(clui, 'local changes')).toEqual([push]);
	});
	it('find multiple commands via description', () => {
		// find multiple commands via description
		expect(search(clui, '[test]')).toEqual([git, push]);
	});
	it('zero matches', () => {
		// find multiple commands via description
		expect(search(push, 'local changes')).toEqual([]);
	});
});