import convert from '../lib/converter';
import run from '../lib/runner';

import _git from './clui_one_command';
import { Command, Arg, default as CLUI } from '../clui';

const git = convert(_git);
const push: any = git.children[0];

const clui = new CLUI();
clui.load(git);

describe('runner', () => {
	it('run a command by itself', async () => {
    const result = await run(clui, [
      git,
      push]);
    expect(result.success).toBe(false);
		expect(result.output).toBe('Error: Missing required arguments');
	});
	it('run a command with one required arg', async () => {
    const result = await run(clui, [
      git,
      push,
      new Arg({...push.children[0], value: 'origin'})]);
    expect(result.success).toBe(false);
		expect(result.output).toBe('Error: Missing required arguments');
	});
	it('run a command with one required arg and flag', async () => {
    const result = await run(clui, [
      git,
      push,
      new Arg({...push.children[0], value: 'origin'}),
      new Arg({...push.children[2], value: true})]);
    expect(result.success).toBe(false);
		expect(result.output).toBe('Error: Missing required arguments');
	});
	it('run a command with all required args', async () => {
    const result = await run(clui, [
      git,
      push,
      new Arg({...push.children[0], value: 'origin'}),
      new Arg({...push.children[1], value: 'master'})]);
    expect(result.success).toBe(true);
  });
	it('run a command with all required args and flag', async () => {
    const result = await run(clui, [
      git,
      push,
      new Arg({...push.children[0], value: 'origin'}),
      new Arg({...push.children[1], value: 'master'}),
      new Arg({...push.children[2], value: true})]);
    expect(result.success).toBe(true);
  });
	it('run with an array of arguments', async () => {
		const result = await run(push.children, []);
		expect(result.success).toBe(false);
		expect(result.output).toBe('Error: Command not found');
	});
	it('run with an object', async () => {
		// @ts-expect-error
		const result = await run({}, []);
		expect(result.success).toBe(false);
		expect(result.output).toBe('Error: Command not found');
	});

	describe('string as input', () => {
		it('run a command with clui as the root', async () => {
			const result = await run(clui, 'git push');
			expect(result.success).toBe(false);
			expect(result.output).toBe('Error: Missing required arguments');
		});
		it('run a command with by itself', async () => {
			const result = await run(git, 'push');
			expect(result.success).toBe(false);
			expect(result.output).toBe('Error: Missing required arguments');
		});
		it('run a command with the command as the root', async () => {
			const result = await run(git, 'push origin');
			expect(result.success).toBe(false);
			expect(result.output).toBe('Error: Missing required arguments');
		});
		it('run a command with the sub-command as the root', async () => {
			const result = await run(push, 'origin');
			expect(result.success).toBe(false);
			expect(result.output).toBe('Error: Missing required arguments');
		});
		it('run a command with all required args', async () => {
			const result = await run(clui, 'git push origin master -f');
			expect(result.success).toBe(true);
		});
		it('run a command with no run function', async () => {
			const result = await run(new Command({...push, run: undefined}), 'origin master');
			expect(result.success).toBe(false);
			expect(result.output).toBe('Error: Command has no run function');
		});
	});
});