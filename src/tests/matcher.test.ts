import convert from '../lib/converter';

import _git from './clui_one_command';
import { Command, Arg, default as CLUI } from '../clui';

const git = convert(_git);
const push: Command = git.children[0] as Command;

const clui = new CLUI();
clui.load(git);

describe('matcher', () => {
	it('match a command', () => {
		expect(clui.match(clui, [
			{type: 'cmd', val: 'git'}
		])).toEqual([git]);
	});
	it('match a sub-command', () => {
		expect(clui.match(clui, [
			{type: 'cmd', val: 'git'},
			{type: 'cmd', val: 'push'}
		])).toEqual([git, push]);
	});
	it('match all tokens (cmd | arg)', () => {
		expect(clui.match(clui, [
			{type: 'cmd', val: 'git'},
			{type: 'cmd', val: 'push'},
			{type: 'cmd', val: 'origin'}
		])).toEqual([
			git,
			push,
			{ ...push.children[0], value: 'origin' },
		]);
		expect(clui.match(clui, [
			{type: 'cmd', val: 'git'},
			{type: 'cmd', val: 'push'},
			{type: 'cmd', val: 'origin'},
			{type: 'cmd', val: 'master'}
		])).toEqual([
			git,
			push,
			{ ...push.children[0], value: 'origin' },
			{ ...push.children[1], value: 'master' },
		]);
		expect(clui.match(clui, [
			{type: 'cmd', val: 'git'},
			{type: 'cmd', val: 'push'},
			{type: 'cmd', val: 'origin'},
			{type: 'cmd', val: 'master'},
			{type: 'opt', val: 'f'},
		])).toEqual([
			git,
			push,
			{ ...push.children[0], value: 'origin' },
			{ ...push.children[1], value: 'master' },
			{ ...push.children[2], value: true },
		]);
	});
	it('match & return unknown tokens', () => {
		expect(clui.match(clui, [
			{type: 'cmd', val: 'git'},
			{type: 'cmd', val: 'hello'},
			{type: 'cmd', val: 'origin'},
			{type: 'cmd', val: 'master'},
			{type: 'opt', val: 'f'},
		])).toEqual([
			git,
			{ name: 'hello', unknown: true },
			{ name: 'origin', unknown: true },
			{ name: 'master', unknown: true },
			{ name: 'f', unknown: true },
		]);
	});
	it('match tokens with custom root element', () => {
		expect(clui.match(new Command(git), [
			{type: 'cmd', val: 'push'},
			{type: 'cmd', val: 'origin'}
		])).toEqual([
			push,
			{ ...push.children[0], value: 'origin' },
		]);
		expect(clui.match(new Command(push), [
			{type: 'cmd', val: 'origin'},
			{type: 'cmd', val: 'master'}
		])).toEqual([
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