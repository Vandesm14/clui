import convert from '../lib/converter';
// import { default as run, checkRun } from '../lib/runner';

import _git from './clui_one_command';
import { Command, Arg, default as CLUI } from '../clui';
import { checkRun } from '../lib/runner';

const git = convert(_git);
const push: Push = git.children[0] as Push;

interface Push extends Command {
  type: 'arg',
  children: Arg[];
}

const clui = new CLUI();
clui.load(git);

const run = clui.run;

describe('checkRun', () => {
	it('valid command and args', () => {
		expect(checkRun(clui, [
      git,
      push,
      new Arg({...push.children[0], value: 'origin'}),
      new Arg({...push.children[1], value: 'master'})
		])).toBe(true);
	});
	it('valid command', () => {
		expect(checkRun(clui, [git, push])).toBe(false);
	});
	it('no run function', () => {
		expect(checkRun(clui, [git])).toBe(false);
	});
});

describe('runner', () => {
	it('run a command by itself', async () => {
    const result = await run(clui, [git, push]);
    expect(result.success).toBe(false);
		expect(result.output).toBe('Error: Missing required arguments');
	});
	it('run a command with one required arg', async () => {
    const result = await run(clui, [
      git,
      push,
      new Arg({...push.children[0], value: 'origin'})
		]);
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
    // @ts-expect-error
		const result = await run(push.children, []);
		expect(result.success).toBe(false);
		expect(result.output).toBe('Error: Missing command');
	});
	it('run with an object', async () => {
		// @ts-expect-error
		const result = await run({}, []);
		expect(result.success).toBe(false);
		expect(result.output).toBe('Error: Missing command');
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