import type * as types from '../clui.types';
import { Command, Arg } from '../clui.types';
import type * as parser from './parser';
import clui from '../clui';

export type matcher = (Command | Arg)[];

export default function(root: Command | clui, tokens: parser.Token[]): matcher {
	let list = [];
	if (root instanceof clui) root = new Command({name: 'h', type: 'cmd', children: root.commands ?? []});
	if (root instanceof Command) { // Is a command
		let cmd = root as Command;
		let argIndex;
		for (let i = 0; i < tokens.length; i++) {
			let token = tokens[i];
			if (cmd.type && cmd.children !== undefined) { // If command has children
				if (cmd.type === 'cmd') { // Command has commands
					// @ts-expect-error TODO: Fix this if possible?
					let find = cmd.children.find((el: Command | Arg) => el.name === (token.val as string));
					if (find) {
						cmd = find;
						list.push(cmd);
					}
				} else if (cmd.type === 'arg') { // Command has args
					if (argIndex === undefined) argIndex = i;
					// list.push({...cmd.children[i - argIndex], value: token.type === 'opt' || token.val});
					list.push(new Arg({...(cmd.children[i - argIndex] as Arg), value: token.type === 'opt' || token.val}));
				}
			} else {
				return list;
			}
		}
		return list;
	} else {
		throw new Error('Invalid root type (root has to be a Command)');
	}
}