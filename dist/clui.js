import * as comps from './comps.js';
export default class CLUI {
    constructor(selector, commands) {
        const element = document.querySelector(selector);
        if (element)
            element.innerHTML = comps.main();
        else
            throw new Error('Selector does not point to an element');
    }
    load() {
    }
}
;
export function parse(input) {
    const tokens = [];
    let i = 0;
    const peek = () => input.charAt(i);
    const next = () => input.charAt(i++);
    const eof = () => peek() === "";
    const croak = (err) => { throw err; };
    const isId = (ch) => /[a-z_]/i.test(ch);
    const isFlag = (ch) => "-".indexOf(ch) >= 0;
    const isBool = (word) => "true false".indexOf(word) >= 0;
    const isStr = (ch) => `"'`.indexOf(ch) >= 0;
    const isNum = (ch) => /[0-9]/.test(ch);
    const take = (fn) => {
        let token = "";
        while (!eof() && fn(peek()))
            token += next();
        return token;
    };
    while (!eof()) {
        const ch = next();
        if (ch === " ")
            continue;
        if (isId(ch)) {
            const id = ch + take(isId);
            if (isBool(id))
                tokens.push({ type: "boolean", val: Boolean(id) });
            else
                tokens.push({ type: "cmd", val: id });
        }
        else if (isFlag(ch)) {
            const flag = ch + take(isFlag);
            if (flag.length === 1)
                tokens.push({ type: "opt", val: next() });
            else if (flag.length === 2)
                tokens.push({ type: "opt", val: take(isId) });
            else
                croak(Error(`too many recurring "-" in flag`));
        }
        else if (isStr(ch)) {
            tokens.push({ type: "string", val: take(val => val !== ch) });
            next();
        }
        else if (isNum(ch)) {
            let decimal = false;
            const num = ch + take(val => {
                if (val === ".") {
                    if (decimal)
                        croak(Error(`too many recurring "." in number`));
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
