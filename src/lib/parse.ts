/**
 * @author: Leonski <https://github.com/leonskidev>
 * @module: parser
 */

import type clui from '../clui';
import type { Tokens } from '../clui';
import match from './match';
export type ParserToken = TokenOther | TokenNumber | TokenBoolean;

interface TokenBase {
	type: any,
	val: any,
	cursor?: boolean
}

interface TokenOther extends TokenBase {
  type: "cmd" | "opt" | "string";
  val: string;
}

interface TokenNumber extends TokenBase {
  type: "number";
  val: number;
}

interface TokenBoolean extends TokenBase {
  type: "boolean";
  val: boolean;
}

interface options {
	cursor?: {start: number, end?: number}
}

function parse(this: clui, input: string, opts?: options): Tokens {
	const tokens: ParserToken[] = [];
	const cursor = opts?.cursor;
	let i = 0;

	const peek = () => input.charAt(i);
	const next = () => input.charAt(i++);
	const eof = () => peek() === "";
	const croak = (err: Error) => { throw err; };

	const isId = (ch: string) => /[a-z_]/i.test(ch);
	const isFlag = (ch: string) => "-".indexOf(ch) >= 0;

	const isBool = (word: string) => ['true', 'false'].includes(word);
	const isStr = (ch: string) => `"'`.indexOf(ch) >= 0;
	const isNum = (ch: string) => /[0-9]/.test(ch);

	const add = (token: ParserToken, i: number) => {
		const {type, val} = {...token};
		if (cursor && cursor.start !== undefined) {
			if (cursor.end === undefined) cursor.end = cursor.start;
			// @ts-expect-error
			tokens.push({type, val, cursor: i - val.length <= cursor.end && i >= cursor.start});
		} else {
			// @ts-expect-error
			tokens.push({type, val});
		}
	}

	const take = (fn: (ch: string) => boolean) => {
		let token = "";
		while(!eof() && fn(peek())) token += next();
		return token;
	};

	while(!eof()) {
		const ch = next();
		if(ch === " ") continue;
		// ids (git, merge)
		if(isId(ch)) {
			const id = ch + take(isId);

			// e.g. true, false
			if(isBool(id)) add({ type: "boolean", val: Boolean(id) }, i);
			// e.g. git, merge
			else add({ type: "cmd", val: id }, i);
			// flags (-f, --flag)
		}	else if(isFlag(ch)) {
			const flag = ch + take(isFlag);

			// e.g. -f
			if(flag.length === 1) add({ type: "opt", val: next() }, i);
			// e.g. --flag
			else if(flag.length === 2) add({ type: "opt", val: take(isId) }, i);
			// error
			else croak(Error(`too many recurring "-" in flag`));
			// str ("hello, world!")
		}	else if(isStr(ch)) {
			add({ type: "string", val: take(val => val !== ch) }, i);
			next();
			// num (1234, 12.34)
		}	else if(isNum(ch)) {
			let decimal = false;
			const num = ch + take(val => {
				if(val === ".") {
					if(decimal) croak(Error(`too many recurring "." in number`));
					decimal = true;
					return true;
				}
				return isNum(val);
			});
			add({ type: "number", val: Number(num) }, i);
		}
	}

	return match.call(this, tokens);
}

export default parse;