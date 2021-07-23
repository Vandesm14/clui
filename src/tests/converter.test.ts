import convert from '../lib/converter';

import git from './clui_one_command';

import { Command, Arg } from '../clui';

let out = convert(git);

describe('converter', () => {
	it('convert command', () => {
    expect(out instanceof Command).toBe(true);
	});
	it('convert subcommand', () => {
    expect(out.children[0] instanceof Command).toBe(true);
	});
  it('convert argument', () => {
    expect((out.children[0] as Command).children[0] instanceof Arg).toBe(true);
  });
});