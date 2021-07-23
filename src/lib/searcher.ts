// @ts-nocheck
import { Command, Arg, default as clui } from "../clui";
import Fuse from "fuse.js";

export default function(root: Command | clui, query: string) {
	if (root instanceof clui) root = root.commands ?? [];
	else root = [root];

	const flatten = (commands: Command[]): Command[] => {
		let result: Command[] = [];
		for (let command of commands) {
			result.push(command);
			if (command.type === 'cmd' && command.children) result = result.concat(flatten(command.children));
		}
		return result;
	};

	let list = flatten(root, query);
	const options = {
		keys: [
			'name',
			'description'
		]
	};
	const fuse = new Fuse(list, options);
	
	return fuse.search(query).map(el => el.item);
}