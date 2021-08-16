<!-- fake warning -->
<svelte:options tag="clui-main" immutable={true} />

<script lang="ts">
	import commands from './commands';
	import { Command, Arg } from './clui';
	import CLUI from './clui';
	const clui = new CLUI();

	// @ts-expect-error
	window.clui = clui;
	clui.load(...commands);

	let current: (Command | Arg)[] = [];
	let correct: (Command | Arg)[] = [];
	let list: Command[] = [];
	let canRun = false;

	let selection = 0;
	let focus = false;
	let value = '';

	$: updateCorrect(current);
	
	// @ts-expect-error
	const updateCorrect = (current) => correct = current.filter(el => !el.unknown);

	const search = () => {
		if (value) {
			current = clui.parseMatch(value);
			updateCorrect(current);
			const last = correct[correct.length - 1];
			list = clui.search((last && last instanceof Command ? last : clui), value, {withPath: true});
			selection = list.length ? Math.min(selection, list.length - 1) : 0;
		} else if (focus) {
			list = clui.commands;
			current = [];
			correct = [];
		} else {
			list = [];
		}
		
		canRun = clui.checkRun(clui, current);
	};

	const keyHandler = (e: KeyboardEvent) => {
		switch (e.key) {
			case 'ArrowDown':
				selection = Math.min(selection + 1, list.length - 1);
				break;
			case 'ArrowUp':
				selection = Math.max(selection - 1, 0);
				break;
			case 'Tab':
				e.preventDefault();
				resolve(current, list[selection].path || list[selection]);
				break;
			case 'Enter':
				e.preventDefault();
				resolve(current, list[selection].path || list[selection]);
				break;
		}
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
		if (canRun) clui.run(clui, current);
	};
</script>

<div id="clui-fragment">
	<div class="cli">
		<div class="input">
			<img src="fav.png" alt="icon" class="icon" style="width: 1.6rem; padding-left: 0.4rem">
			<input type="text" placeholder="Enter a command" bind:value={value} on:keydown={keyHandler} on:keyup={search} on:focus={(e)=>{focus=true; search()}} on:blur={(e)=>{focus=false; search()}}>
			<span class="input-button {value === '' ? '' : 'show'}">
				{canRun ? 'run' : 'form'}
			</span>
		</div>
		<div class="dropdown">
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
		<div class="form"></div>
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
	
	.input {
		position: relative;
		display: flex;
		align-items: center;
		border: 2px solid var(--medium);
		border-radius: 3px;
		background-color: var(--dark);
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
	}
	.input > .input-button.show {
		display: inline-block;
	}
	.input > .input-button:hover {
		background-color: var(--light);
		color: var(--text-light);
		cursor: pointer;
	}

	.dropdown {
		overflow-y: auto;
		min-width: 40vw;
		max-width: 60vw;
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
</style>