import convert from '../lib/convert';
import run from '../lib/runner';

import { Command, Arg } from '../clui.types';

import _git from './clui_one_command';

const git = convert(_git);
const push: any = git.children[0];

describe('runner', () => {
	it.todo('run command by itself');
	it.todo('run command with one required arg');
	it.todo('run command with one required arg and flag');
	it('run command with all required args', async () => {
    const result = await run([git, push, new Arg({...push.children[0], value: 'origin'}), new Arg({...push.children[1], value: 'master'})]);
    expect(result).toBe(true);
  });
	it.todo('run command with all required args and flag');
});