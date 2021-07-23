import { Command, Arg, default as clui } from "../clui";
import Fuse from "fuse.js";

export default function(root: Command | clui, query: string, getPath?: boolean) {
	let cmd: Command[] | [];
	if (root instanceof clui && !getPath) return root.fuse.search(query).map(el => el.item);
	else if (root instanceof clui) cmd = root.commands ?? [];
	else cmd = root.type === 'cmd' && root.children ? root.children as Command[] : [];

	const flatten = (commands: Command[], path: Command[] = []): Command[] => {
		let result: Command[] = [];
		for (let command of commands) {
			path.push(command);
			if (getPath) result.push(new Command({...command, path: [...path]}));
			else result.push(command);

			if (command.type === 'cmd' && command.children) result = result.concat(flatten(command.children as Command[], path));
			path.pop();
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