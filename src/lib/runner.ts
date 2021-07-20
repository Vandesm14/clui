import type * as types from '../clui.types';
import type { matcher } from './matcher';

export default function(tokens: matcher) {
	for (let i = 0; i < tokens.length; i++) {
		let token = tokens[i];
		// if ((token as types.Command).children) { // if token is a command
	}
}