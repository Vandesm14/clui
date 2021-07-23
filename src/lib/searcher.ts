import { Command, Arg, default as clui } from "../clui";
import Fuse from "fuse.js";

export default function(root: Command | clui, query: string) {
	let cmd: Command[] | [];
	if (root instanceof clui) return root.fuse.search(query).map(el => el.item);
	else cmd = root.type === 'cmd' && root.children ? root.children as Command[] : [];

	const flatten = (commands: Command[]): Command[] => {
		let result: Command[] = [];
		for (let command of commands) {
			result.push(command);
			if (command.type === 'cmd' && command.children) result = result.concat(flatten(command.children as Command[]));
		}
		return result;
	};

	let list = flatten(cmd);
	const options = {
		keys: [
			'name',
			'description'
		]
	};
	const fuse = new Fuse(list, options);
	
	return fuse.search(query).map(el => el.item);
}