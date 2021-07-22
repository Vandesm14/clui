import convert from '../lib/converter';
import run from '../lib/runner';

import { Command, Arg } from '../clui';

import _git from './clui_one_command';

const git = convert(_git);
const push: any = git.children[0];

describe('runner', () => {
	it('run a command by itself', async () => {
    const result = await run(git, [
      git,
      push]);
    expect(result.success).toBe(false);
	});
	it('run a command with one required arg', async () => {
    const result = await run(git, [
      git,
      push,
      new Arg({...push.children[0], value: 'origin'})]);
    expect(result.success).toBe(false);
	});
	it('run a command with one required arg and flag', async () => {
    const result = await run(git, [
      git,
      push,
      new Arg({...push.children[0], value: 'origin'}),
      new Arg({...push.children[2], value: true})]);
    expect(result.success).toBe(false);
	});
	it('run a command with all required args', async () => {
    const result = await run(git, [
      git,
      push,
      new Arg({...push.children[0], value: 'origin'}),
      new Arg({...push.children[1], value: 'master'})]);
    expect(result.success).toBe(true);
  });
	it('run a command with all required args and flag', async () => {
    const result = await run(git, [
      git,
      push,
      new Arg({...push.children[0], value: 'origin'}),
      new Arg({...push.children[1], value: 'master'}),
      new Arg({...push.children[2], value: true})]);
    expect(result.success).toBe(true);
  });

	describe('string as input', () => {
		it('run a command with by itself', async () => {
			const result = await run(git, 'git push');
			expect(result.success).toBe(false);
		});
		it('run a command with one required arg', async () => {
			const result = await run(git, 'git push origin');
			expect(result.success).toBe(false);
		});
		it('run a command with all required args', async () => {
			const result = await run(git, 'git push origin master -f');
			expect(result.success).toBe(true);
		});
	});
});