import type * as types from '../command.types';
import type * as parser from './parser';
import clui from '../clui';

export default function(root: types.Command | clui, tokens: parser.Token[], matchAll = false): types.Command | types.Command[] | Array<types.Command | types.Arg> {
	let list = [];
	if (root instanceof clui) root = {name: 'h', type: 'cmd', children: root.commands ?? []};
	// @ts-expect-error
	if (typeof root.name === 'string' && root.children?.length > 0) { // Is a command
		let cmd = root as types.Command;
		let argIndex;
		for (let i = 0; i < tokens.length; i++) {
			let token = tokens[i];
			if (cmd.children) { // If command has children
				if (cmd.type === 'cmd') { // Command has commands
					let find = (cmd.children as types.Command[]).find(el => el.name.indexOf((token.val as string)) !== -1);
					if (find) {
						cmd = find;
						list.push(cmd);
					}
				} else if (cmd.type === 'arg') { // Command has args
					if (argIndex === undefined) argIndex = i;
					list.push(cmd.children[i - argIndex]);
				}
			} else {
				if (matchAll) return list;
				else return cmd;
			}
		}
		if (matchAll) return list;
		else return cmd;
	} else {
		throw new Error('Invalid root type');
	}
}