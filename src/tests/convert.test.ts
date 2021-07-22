import convert from '../lib/convert';
import git from './clui_one_command';

import { Command, Arg } from '../clui';

describe('converter', () => {
	it('convert command', () => {
		let out = convert(git);
    expect(out instanceof Command).toBe(true);
	});
	it('convert subcommand', () => {
		let out = convert(git);
    expect(out.children[0] instanceof Command).toBe(true);
	});
  it('convert argument', () => {
		let out = convert(git);
    expect((out.children[0] as Command).children[0] instanceof Arg).toBe(true);
  });
});