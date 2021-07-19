export type Token = TokenOther | TokenNumber | TokenBoolean;

interface TokenOther {
  type: "cmd" | "opt" | "string";
  val: string;
}

interface TokenNumber {
  type: "number";
  val: number;
}

interface TokenBoolean {
  type: "boolean";
  val: boolean;
}

class Tokens extends Array {
	
}

function parse(input: string) {
	const tokens: Token[] = [];
	let i = 0;

	const peek = () => input.charAt(i);
	const next = () => input.charAt(i++);
	const eof = () => peek() === "";
	const croak = (err: Error) => { throw err; };

	const isId = (ch: string) => /[a-z_]/i.test(ch);
	const isFlag = (ch: string) => "-".indexOf(ch) >= 0;

	const isBool = (word: string) => "true false".indexOf(word) >= 0;
	const isStr = (ch: string) => `"'`.indexOf(ch) >= 0;
	const isNum = (ch: string) => /[0-9]/.test(ch);

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

			if(isBool(id)) tokens.push({ type: "boolean", val: Boolean(id) }); // e.g. true, false
			else tokens.push({ type: "cmd", val: id }); // e.g. git, merge
		}	else if(isFlag(ch)) { // flags (-f, --flag)
			const flag = ch + take(isFlag);

			if(flag.length === 1) tokens.push({ type: "opt", val: next() }); // e.g. -f
			else if(flag.length === 2) tokens.push({ type: "opt", val: take(isId) }); // e.g. --flag
			else croak(Error(`too many recurring "-" in flag`)); // error
		}	else if(isStr(ch)) { // str ("hello, world!")
			tokens.push({ type: "string", val: take(val => val !== ch) });
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
			tokens.push({ type: "number", val: Number(num) });
		}
	}

	// @ts-expect-error: Unbeknownst to TS, you CAN create a new array using Array(...[])
	return new Tokens(...tokens);
}

export default parse;