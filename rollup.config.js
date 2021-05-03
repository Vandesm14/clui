import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import css from "rollup-plugin-css-only";
import sveltePreprocess from "svelte-preprocess";
import typescript from '@rollup/plugin-typescript';

import { readdirSync } from "fs";

const dev = Boolean(process.env.ROLLUP_WATCH);

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require("child_process").spawn("npm", ["run", "start", "--", "--dev"], {
				stdio: ["ignore", "inherit", "inherit"],
				shell: true
			});

			process.on("SIGTERM", toExit);
			process.on("exit", toExit);
		}
	};
}

let exports = []; 

for(let page of readdirSync("./docs").filter(name => name.endsWith(".html"))) {
	let name = page.replace(".html", "");

	exports.push(
		{
			input: `src/${name}.ts`,
			output: {
				name,
				file: `docs/build/${name}.js`,
				format: "iife"
			},
			plugins: [
				svelte({
					dev,
					emitCss: true,
					preprocess: sveltePreprocess({ sourceMap: dev })
				}),
				css({ output: `${name}.css` }),
				resolve({ browser: true, dedupe: ["svelte"] }),
				commonjs(),
				typescript({
					sourceMap: dev,
					inlineSources: dev
				}),

				dev && livereload("docs"),
				!dev && terser()
			]
		}
	);
}

if(dev) exports[exports.length - 1].plugins.push(serve());

export default exports;