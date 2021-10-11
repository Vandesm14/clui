import clui, { Command, Arg, Tokens } from '../clui';
import type { ParserToken } from './parser';

// TODO: create an unknown command and arg type with the unknown property (true)
export type MatcherToken = Tokens;

interface UnknownCommand extends Command {
	unknown: true
}

interface UnknownArg extends Arg {
	unknown: true
}

export default function(root: Command | clui, tokens: ParserToken[]): MatcherToken {
	let list = [];
	if (root instanceof clui) root = new Command({name: 'h', type: 'cmd', children: root.commands ?? []});
	if (root instanceof Command) { // Is a command
		let cmd = root as Command;
		let argIndex;
		for (let i = 0; i < tokens.length; i++) {
			let token = tokens[i];
			if (cmd instanceof Command && cmd.type && 'children' in cmd) { // If command has children
				if (cmd.type === 'cmd') { // Command has commands
					const children = cmd.children as Command[];
					let find = children.find((el: Command | Arg) => el.name === (token.val as string));
					if (find) {
						cmd = find;
						list.push(cmd);
					} else { // unknown token
            list.push(...tokens.slice(i).map(el => {return {name: el.val, unknown: true}}));
						// @ts-expect-error
            return list;
          }
				} else if (cmd.type === 'arg') { // Command has args
					if (argIndex === undefined) argIndex = i;
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