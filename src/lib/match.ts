import type * as types from '../command.types';
import type * as parser from './parser';
import clui from '../clui';

export default function(root: types.Command | clui, tokens: parser.Token[], matchAll = false): types.Command | undefined {
	if (root instanceof clui) root = {name: 'h', type: 'cmd', children: root.commands ?? []};
	// @ts-expect-error
	if (typeof root.name === 'string' && root.children?.length > 0) { // Is a command
		let cmd = root as types.Command;
		for (let token of tokens) {
			if (token.type === 'cmd') { // Token is a command
				if (cmd.type === 'cmd' && cmd.children) { // Command children has commands
					let find = (cmd.children as types.Command[]).find(el => el.name.indexOf((token.val as string)) !== -1);
					if (find) cmd = find;
				} else if (cmd.type === 'arg') { // Has args
					return cmd;
				}
			} else {
				return cmd;
			}
		}
		return cmd;
	} else {
		throw new Error('Invalid root type');
	}
}