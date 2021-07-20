import type * as types from '../clui.types';
import type * as parser from './parser';
import clui from '../clui';

export type matcher = (types.Command | types.Arg)[];

export default function(root: types.Command | clui, tokens: parser.Token[]): matcher {
	let list = [];
	if (root instanceof clui) root = {name: 'h', type: 'cmd', children: root.commands ?? []};
	// @ts-expect-error
	if (typeof root.name === 'string' && root.children?.length > 0) { // Is a command
		let cmd = root as types.Command;
		let argIndex;
		for (let i = 0; i < tokens.length; i++) {
			let token = tokens[i];
			if (cmd.type && cmd.children) { // If command has children
				if (cmd.type === 'cmd') { // Command has commands
					let find = cmd.children?.find(el => el.name === (token.val as string));
					if (find) {
						cmd = find;
						list.push(cmd);
					}
				} else if (cmd.type === 'arg') { // Command has args
					if (argIndex === undefined) argIndex = i;
					list.push({...cmd.children[i - argIndex], value: token.type === 'opt' || token.val});
				}
			} else {
				return list;
			}
		}
		return list;
	} else {
		throw new Error('Invalid root type');
	}
}