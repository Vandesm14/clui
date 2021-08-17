export type Token = TokenOther | TokenNumber | TokenBoolean;

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

class Tokens extends Array {
	
}

function parse(input: string, cursor?: {start: number, end?: number}) {
	const tokens: Token[] = new Tokens();
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

	const add = (token: Token, i: number) => {
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

		if(isId(ch)) { // ids (git, merge)
			const id = ch + take(isId);

			if(isBool(id)) add({ type: "boolean", val: Boolean(id) }, i); // e.g. true, false
			else add({ type: "cmd", val: id }, i); // e.g. git, merge
		}	else if(isFlag(ch)) { // flags (-f, --flag)
			const flag = ch + take(isFlag);

			if(flag.length === 1) add({ type: "opt", val: next() }, i); // e.g. -f
			else if(flag.length === 2) add({ type: "opt", val: take(isId) }, i); // e.g. --flag
			else croak(Error(`too many recurring "-" in flag`)); // error
		}	else if(isStr(ch)) { // str ("hello, world!")
			add({ type: "string", val: take(val => val !== ch) }, i);
			next();
		}	else if(isNum(ch)) { // num (1234, 12.34)
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

	return tokens;
}

export default parse;