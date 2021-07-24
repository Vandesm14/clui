import convert from '../lib/converter';

import _git from './clui_one_command';
import { Command, Arg } from '../clui';


const git = convert(_git);
const push: Command = git.children[0] as Command;

describe('converter', () => {
	it('convert command', () => {
    expect(git instanceof Command).toBe(true);
	});
	it('convert subcommand', () => {
    expect(push instanceof Command).toBe(true);
	});
  it('convert argument', () => {
    expect(push.children[0] instanceof Arg).toBe(true);
  });
});