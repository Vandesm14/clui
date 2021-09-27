<!-- <svelte:options tag="clui-main" immutable={true} /> -->

<script lang="ts">
	import commands from './commands';
	import Item from './comps/Item.svelte';
	import { Command, Arg } from './clui';
	import type { OutputItem, Response } from './lib/runner';
	import CLUI from './clui';
	const clui = new CLUI();

	// @ts-expect-error
	window.clui = clui;
	clui.load(...commands);

	let current: (Command | Arg)[] = [];
	let correct: (Command | Arg)[] = [];
	let list: Command[] = [];
	let canRun = false;

	class Page {
		items: OutputItem[];
		command: Command;
		path: (Command | Arg)[];
		title: string;
		id: string;

		constructor(items: OutputItem[], path: (Command | Arg)[], command: Command) {
			this.items = items ?? [];
			this.path = path;
			this.command = clui.getLastCommand(path);
			this.title = command?.name ?? '';
			this.id = Math.random().toString(36).substr(2, 9);
		}
	}

	class Handler implements Response {
		private page: Page;
		constructor(page: Page) {
			this.page = page;
		}

		out(items: OutputItem[]) {
			console.log('hey', items);
			this.page.items = items;
		}

		status(status: 'ok' | 'err' | string) {
			// do nothing
		}
	}

	let pages: Page[] = [];
	let form: Page
	let showForm = false;

	let selection = 0;
	let focus = false;
	let value = '';

	let cursor = [0, 0];

	$: updateCorrect(current);

	const updateCorrect = (current: (Command | Arg)[]) => correct = current.filter(el => el.unknown !== true);

	const search = () => {
		if (value && (clui.getLastCommand(current)?.type === 'cmd' || clui.getLastCommand(current) === undefined)) {
			current = clui.parseMatch(value, clui, {start: cursor[0], end: cursor[1]});
			updateCorrect(current);
			const last = correct[correct.length - 1];

			if (value.endsWith(' ') && last instanceof Command && last.type === 'cmd') list = last.children as Command[];
			else list = clui.search((last && last instanceof Command ? last : clui), current[current.length - 1]?.name || '', {withPath: true});

			selection = list.length ? Math.min(selection, list.length - 1) : 0;
		} else if (clui.getLastCommand(current)?.type === 'arg') {
			current = clui.parseMatch(value, clui, {start: cursor[0], end: cursor[1]});
			updateCorrect(current);
			list = [];
		} else if (focus) {
			list = clui.commands;
			current = [];
			correct = [];
		} else {
			// list = [];
		}

		if (clui.getLastCommand(current)?.name !== form?.command?.name) showForm = false;

		canRun = clui.checkRun(clui, current);
	};

	const keyHandler = (e: KeyboardEvent) => {
		const target = e.target as HTMLInputElement;

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				selection = Math.min(selection + 1, list.length - 1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				selection = Math.max(selection - 1, 0);
				break;
			case 'Tab':
				e.preventDefault();
				resolve(current, list[selection].path || list[selection]);
				break;
			case 'Enter':
				const last = clui.getLastCommand(current);
				e.preventDefault();
				if (last?.hasOwnProperty('run')) run();
				else resolve(current, list[selection].path || list[selection]);
				break;
		}

		cursor = [target.selectionStart, target.selectionEnd];
	};

	const resolve = (tokens: (Command | Arg)[], token: (Command | Arg) | (Command | Arg)[]) => {
		if (!Array.isArray(token)) token = [token];
		const index = tokens.findIndex(el => el.unknown);
		if (index !== -1) tokens.splice(index, 1, ...token);
		else tokens.push(...token);
		value = toString(tokens) + ' ';
		search();
	};

	const toString = (tokens: (Command | Arg)[]) => {
		return tokens.map(el => {
			if (el instanceof Command) return el.name;
			else return el.value;
		}).join(' ');
	};

	const run = () => {
		if (canRun) {
			const command = clui.getLastCommand(current);
			const page = new Page([], current, command);
			clui.run(clui, current, new Handler(page));
			pages = [page, ...pages];
			clear();
		}	else {
			if (clui.getLastCommand(current)?.type !== 'arg') return;
			const command = clui.getLastCommand(current);

			const args: Arg[] = command.children as Arg[];
			for (let item of current) {
				if (item instanceof Arg) {
					const index = args.findIndex(el => el.name === item.name);
					args[index].value = item.value;
				}
			}

			form = new Page(
				[...args,	{
					name: 'Run',
					type: 'button',
					run: () => {
						form.items.pop();
						const params = [...current.filter(el => el instanceof Command), ...form.items as Arg[]];
						const page = new Page([], params, command);
						const res = clui.checkRun(clui, params);
						if (res) {
							clui.run(clui, params, new Handler(page));
							pages = [page, ...pages];
							clear();
						} else {
							console.log('Cannot run');
						}
					}
				}],
				current,
				command
			);

			showForm = true;
		}
	};

	const currentWithoutUnknown = (current: (Command | Arg)[]) => {
		current = current.filter(el => el instanceof Command);
		if (current[current.length - 1]?.unknown) return current.slice(0, current.length - 1);
		else return current;
	};

	const clear = () => {
		value = '';
		list = clui.commands;
		showForm = false;
		current = [];
		correct = [];
	};
</script>

<div id="clui-fragment">
	<div class="cli">
		<div class="input">
			<div class="tokens">
				{#each currentWithoutUnknown(current) as token, i}
					<span class="token transparent {token.unknown ? 'unknown' : ''}">{token.name}{@html i === currentWithoutUnknown(current).length - 1 ? '' : '&nbsp;'}</span>
				{/each}
				<!-- {#if focus}
					<span class="token unknown">{list[selection]?.path?.map(el => el.name).join(' ') || list[selection]?.name || ''}</span>
				{/if} -->
			</div>
			<img src="fav.png" alt="icon" class="icon" style="width: 1.6rem; padding-left: 0.4rem">
			<input type="text" placeholder={focus ? '' : 'Enter a command'} bind:value={value} on:keydown={keyHandler} on:input={search} on:focus={(e)=>{focus=true;search()}} on:blur={(e)=>{focus=false;search()}}>
			<button class="input-button {value !== '' && clui.getLastCommand(current)?.hasOwnProperty('run') ? 'show' : ''}" on:click={run}>
				{canRun ? 'run' : 'form'}
			</button>
		</div>
		<div class="dropdown" class:hide={showForm}>
			{#each list as item, i}
				<div class="dropdown-item {i === selection ? 'selected' : ''}" on:mouseover={()=>selection = i}
					on:click={()=>resolve(current, list[selection].path || list[selection])}>
					{#if item.path && item.path.length > 0}
						{#each item.path as p}
							<span class="item-name">{p.name}</span>
						{/each}
					{:else}
						<span class="item-name">{item.name}</span>
					{/if}
					<span class="item-description">{item.description ?? ''}</span>
				</div>
			{/each}
		</div>
		<div class="form" class:hide={!showForm}>
			{#each form?.items ?? [] as item}
				{#if item}
					<Item {item} />
				{/if}
			{/each}
		</div>
	</div>
	<div class="pages">
		{#each pages as page (page.id)}
			<div class="page form">
				{#each page?.items ?? [] as item}
					{#if item}
						<Item {item} />
					{/if}
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	#clui-fragment, #clui-fragment * {
		box-sizing: border-box;
	}
	#clui-fragment {
	--dark: hsl(225, 32%, 13%);
	--darker: hsl(225, 35%, 9%);
	--darkest: hsl(225, 38%, 6%);
	--light: hsl(225, 35%, 36%);
	--medium: hsl(225, 31%, 18%);
	--text-light: hsl(225, 54%, 89%);
	--text-medium: hsl(225, 33%, 64%);
		background-color: var(--darkest);
		color: var(--text-medium);
		font-size: 1.3rem;
		font-family: Calibri, sans-serif;
	}

	#clui-fragment {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0 auto;
	}

	.hide {
		display: none !important;
	}

	.input {
		position: relative;
		display: flex;
		align-items: center;
		border: 2px solid var(--medium);
		border-radius: 3px;
		background-color: var(--dark);
	}

	.input > .tokens {
		left: 2rem;
		position: absolute;
	}

	.input > .tokens > span {
		display: inline-block;
		border-radius: 3px;
	}
	.input > .tokens > span.transparent {
		color: transparent;
	}
	.input > .tokens > span:not(.unknown) {
		background-color: var(--light);
		padding: 0.1rem 0.2rem;
		margin-left: -0.2rem;
		margin-right: -0.2rem;
	}

	.input > input {
		position: relative;
		z-index: 1;
		flex: 1;
		padding: 0.6rem 0.4rem;
		outline: none;
		border: none;
		background-color: transparent;
		color: var(--text-light);
		font-size: inherit;
		font-family: Calibri, sans-serif;
	}

	.input > .input-button {
		margin-right: 0.3rem;
		padding: 0.3rem 0.5rem;
		border: 2px solid var(--light);
		border-radius: 3px;
		display: none;
		user-select: none;
		font: inherit;
		color: inherit;
		background-color: transparent;
	}
	.input > .input-button.show {
		display: inline-block;
	}
	.input > .input-button:hover {
		background-color: var(--light);
		color: var(--text-light);
		cursor: pointer;
	}

	.dropdown, .form {
		overflow-y: auto;
		min-width: 40vw;
		/* max-width: 60vw; */
		max-height: 40vh;
		border-radius: 0 0 3px 3px;
		background-color: var(--darker);
	}

	.dropdown-item {
		position: relative;
		z-index: 1;
		padding: 0.3rem 0.6rem;
		padding-left: 1.6rem;
		border-radius: 3px;
		background-color: var(--darker);
	}
	.dropdown-item.selected {
		outline: 2px solid var(--light);
		outline-offset: -2px;
		background-color: var(--medium);
		color: var(--text-light);
		cursor: pointer;
	}
	.item-name {
		margin-right: 0.3rem;
		padding: 0.3rem 0.5rem;
		border: 2px solid var(--light);
		border-radius: 3px;
		display: inline-block;
	}
	.selected > .item-name {
		background-color: var(--light);
	}

	.form {
		display: flex;
		flex-direction: column;
		padding: 0.6rem 1.2rem;
		max-height: 70vh;
		border-radius: 3px;
		background-color: var(--darker);
	}

	.page {
		margin: 0.2rem 0;
		border: 2px solid var(--medium);
	}

	.pages {
		display: flex;
		flex-direction: column;
		margin-top: 2rem;
	}
</style>