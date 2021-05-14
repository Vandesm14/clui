<script>
	'use strict';

	import clui from './clui.ts';
	import Item from './comps/Item.svelte';
	import {current, value, store} from './stores.js';
	import {fade, fly, slide} from 'svelte/transition';

	window.clui = clui;

	let selection = 0;

	const parse = () => clui.parse($value);
	const execute = () => clui.execute();
	const clear = () => clui.clear();
	const hover = (index) => selection = index;

	const updSelection = () => {
		if ($current?.commands)
		selection = selection >= Object.keys(clui.filter($value)).length ? Object.keys(clui.filter($value)).length - 1 : selection;
		else if ($current?.args)
		selection = selection >= clui.filter($value).length ? clui.filter($value).length - 1 : selection;
		
		selection = selection < 0 ? 0 : selection;
	};

	$: updSelection($store.depth, $store.argDepth);

	const keydown = (e) => {
		if (e.key === 'Enter') {
			clui.execute();
		} else if (e.key === 'Tab') {
			e.preventDefault();
			clui.select(clui.filter($value)[selection]?.name);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selection--;
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			selection++;
		}

		updSelection();
	};
</script>

<!-- <svelte:window on:error={(err)=>new clui.Toast(err.message, 'red')} /> -->

<div class="clui-toasts">
	{#each $store.toasts as toast (toast.id)}
		<div class="clui-toast clui-toast-{toast.color}" in:fly={{x: 200, duration: 500}} out:slide={{duration: 300}}>{toast.msg}</div>
	{/each}
</div>

<div class="clui-cli">
	<div class="clui-cli-input">
		<img src="icons/cli.png" alt="" class="clui-cli-icon">
		{#if $store?.tokens}
			<div class="clui-cli-autocomplete">
				{$store.tokens.slice(0, $store.depth + $store.argDepth).join(' ')} {' '} {$current?.commands ? clui.filter($value)[selection]?.name ?? '' : ''}
			</div>
		{/if}
		<input type="text" placeholder={''} bind:value={$value} on:input={parse} on:keydown={keydown}>
		{#if $current?.run}
			<button class="clui-cli-run" on:click={execute}>{$store.canRun ? 'run' : 'form'}</button>
		{/if}
		{#if $value}
			<button class="clui-cli-run" on:click={clear}>x</button>
		{/if}
	</div>

	<div class="clui-cli-dropdown">
		{#if $current?.commands}
			{#each clui.filter($value) as command, i}
				{#if $store.divider > 0 && i === $store.divider}
					<hr>
				{/if}
				<div class="clui-dropdown-item {i === selection ? 'clui-selected' : ''}"	on:click={()=>clui.select(command.name)} on:mouseover={()=>hover(i)}>
					{#if typeof command.name !== 'number'}
						<span class="clui-dropdown-name">{command.name}</span>
					{/if}
					<span class="clui-dropdown-description">{command.desc}</span>
				</div>
			{/each}
		{:else if $current?.args}
			{#each clui.filter($value) as argument, i}
				{#if $store.divider > 0 && i === $store.divider}
					<hr>
				{/if}
				<div class="clui-dropdown-item {i === selection ? 'clui-selected' : ''}" on:mouseover={()=>hover(i)} on:click={()=>clui.select(argument.name)}>
					<span class="clui-dropdown-name">{(argument.short ? argument.short + ', ' : '') + argument.name}</span>
					<span class="clui-dropdown-description">{argument?.desc}</span>
				</div>
			{/each}
		{/if}
	</div>

	<div class="clui-pages">
		{#each $store.pages as page, i (page.id)}
			<div class="clui-page-container" in:slide={{duration: 200}} out:slide={{duration: 200}}>
				<div class="clui-page-buttons">
					<button on:click={page.reset()}>R</button>
					<button on:click={page.close()}>X</button>
				</div>
				<div class="clui-page">
					{#each $store.pages[i].items as item}
						<Item arg={item} />
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	:global(#clui, #clui *) {
		box-sizing: border-box;
	}

	:global(#clui) {
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

	:global(#clui p, #clui h1) {
		margin: 0;
		padding: 0;
	}

	:global(#clui a, a:visited) {
		color: var(--text-medium);
	}
	:global(#clui a:hover) {
		color: var(--text-light);
	}

	.clui-toasts {
		position: absolute;
		right: 0;
		bottom: 0;
		display: flex;
		overflow: hidden;
		flex-direction: column;
	}

	.clui-toast {
		margin: 0.6rem 1.2rem;
		padding: 0.6rem 1.2rem;
		max-width: 30ch;
		border-radius: 3px;
		background-color: hsl(225, 35%, 36%);
		color: var(--text-light);
	}
	.clui-toast-red {
		background-color: hsl(0, 54%, 40%);
	}
	.clui-toast-yellow {
		background-color: hsl(50, 54%, 40%);
	}
	.clui-toast-green {
		background-color: hsl(100, 54%, 40%);
	}

	.clui-cli {
		display: flex;
		flex-direction: column;
		margin: 4vh auto;
		width: max-content;
	}

	.clui-cli-input {
		position: relative;
		display: flex;
		align-items: center;
		border: 2px solid var(--medium);
		border-radius: 3px 3px 0 0;
		background-color: var(--dark);
	}

	.clui-cli-input > .clui-cli-icon {
		width: 1.6rem;
	}

	.clui-cli-input > .clui-cli-autocomplete {
		position: absolute;
		left: 1.8rem;
		z-index: 1;
		padding: 0 0.2rem;
		border-radius: 2px;
		background-color: var(--light);
	}

	.clui-cli-input > input {
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
	.clui-cli-input > input::placeholder {
		color: var(--text-medium);
	}

	.clui-cli-run {
		margin: 0 0.4rem;
		padding: 0 0.2rem;
		outline: 2px solid var(--light);
		border: none;
		border-radius: 2px;
		background-color: transparent;
		color: var(--text-medium);
		font: inherit;
		cursor: pointer;
	}
	.clui-cli-run:hover {
		background-color: var(--light);
		color: var(--text-light);
	}

	.clui-cli-dropdown {
		overflow-y: auto;
		min-width: 40vw;
		max-width: 60vw;
		max-height: 40vh;
		border-radius: 0 0 3px 3px;
		background-color: var(--darker);
	}

	.clui-cli-dropdown > hr {
		margin: 0.4rem 0.2rem;
		color: var(--light);
	}

	.clui-dropdown-item {
		position: relative;
		z-index: 1;
		padding: 0.6rem 1.2rem;
		padding-left: 2.2rem;
		border-radius: 3px;
		background-color: var(--darker);
	}
	.clui-dropdown-item.clui-selected {
		outline: 2px solid var(--light);
		outline-offset: -2px;
		background-color: var(--light);
		background-color: var(--medium);
		color: var(--text-light);
		cursor: pointer;
	}

	.clui-dropdown-name {
		margin-right: 0.3rem;
		margin-left: -0.5rem;
		padding: 0.3rem 0.5rem;
		border: 2px solid var(--light);
		border-radius: 3px;
	}
	.clui-selected > .clui-dropdown-name {
		background-color: var(--light);
	}

	.clui-pages {
		display: flex;
		flex-direction: column;
		margin: 4vh auto;
		min-width: 40vw;
		max-width: 60vw;
	}

	.clui-page-container {
		margin: 0.8rem 0;
	}

	.clui-page-buttons {
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
	}

	.clui-page-buttons > button {
		padding: 0.3rem 0.5rem;
		border: 2px solid var(--medium);
		border-radius: 3px;
		background-color: transparent;
		color: var(--text-medium);
		cursor: pointer;
	}
	.clui-page-buttons > button:hover {
		border: 2px solid var(--light);
		background-color: var(--light);
		color: var(--text-light);
	}

	.clui-page {
		display: flex;
		overflow-y: auto;
		flex-direction: column;
		margin: 0.2rem 0;
		padding: 0.6rem 1.2rem;
		max-height: 70vh;
		width: 100%;
		border: 2px solid var(--medium);
		border-radius: 3px;
		background-color: var(--darker);
	}

	:global(#clui .clui-page > div) {
		padding: 0.4rem 0;
	}
</style>