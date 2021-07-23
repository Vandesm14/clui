<!-- fake warning -->
<svelte:options tag="clui-main" immutable={true} />

<script lang="ts">
	import commands from './tests/clui_many_commands';
	import type { Command, Arg } from './clui';
	import CLUI from './clui';
	const clui = new CLUI();

	// @ts-expect-error
	window.clui = clui;
	clui.load(...commands);
	const stateful = clui.stateful();

	let current = [];
	let list: Command[] = [];
	let selection = 0;

	let focus = false;

	const search = (e: Event) => {
		const value: string | null = (e.target as HTMLInputElement)?.value;
		if (value) {
			list = stateful.search(value);
		} else if (focus) {
			list = clui.commands;
		} else {
			list = [];
		}
	};
</script>

<div id="clui-fragment">
	<div class="cli">
		<div class="input">
			<input type="text" placeholder="Enter a command" on:keyup={search} on:focus={()=>focus=true} on:blur={()=>focus=false}>
		</div>
		<div class="dropdown">
			{#each list as item, i}
				<div class="dropdown-item {i === selection ? 'selected' : ''}" on:mouseover={()=>selection = i}>
					<span class="item-name">{item.name}</span>
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
		border-radius: 3px 3px 0 0;
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
		padding: 0.6rem 1.2rem;
		padding-left: 2.2rem;
		border-radius: 3px;
		background-color: var(--darker);
	}
	.dropdown-item.selected {
		outline: 2px solid var(--light);
		outline-offset: -2px;
		background-color: var(--light);
		background-color: var(--medium);
		color: var(--text-light);
		cursor: pointer;
	}
	.item-name {
		margin-right: 0.3rem;
		margin-left: -0.5rem;
		padding: 0.3rem 0.5rem;
		border: 2px solid var(--light);
		border-radius: 3px;
	}
	.selected > .item-name {
		background-color: var(--light);
	}
</style>