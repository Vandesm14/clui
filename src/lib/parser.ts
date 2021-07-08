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

export default function(input: string): Token[] {
	const tokens: Token[] = [];

	// setup reader
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

	// start parsing
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
			if(isBool(id)) tokens.push({ type: "boolean", val: Boolean(id) });
			// e.g. git, merge
			else tokens.push({ type: "cmd", val: id });
		}
		// flags (-f, --flag)
		else if(isFlag(ch)) {
			const flag = ch + take(isFlag);

			// e.g. -f
			if(flag.length === 1) tokens.push({ type: "opt", val: next() });
			// e.g. --flag
			else if(flag.length === 2) tokens.push({ type: "opt", val: take(isId) });
			// error
			else croak(Error(`too many recurring "-" in flag`));
		}
		// str ("hello, world!")
		else if(isStr(ch)) {
			tokens.push({ type: "string", val: take(val => val !== ch) });
			next();
		}
		// num (1234, 12.34)
		else if(isNum(ch)) {
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

	return tokens;
}