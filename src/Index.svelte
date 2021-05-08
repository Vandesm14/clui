<script>
	import clui from './clui.js';
	import {fade, fly, slide} from 'svelte/transition';
	import {current, value, store} from './stores.js';

	window.clui = clui;

	let selection = 0;

	const parse = () => clui.parse($value);
	const hover = (index) => selection = index;

	const keydown = (e) => {
		if (e.key === 'Enter') {
			clui.execute($value);
		} else if (e.key === 'Tab') {
			e.preventDefault();
			if ($current?.commands) clui.select(Object.keys(clui.filter($value))[selection]);
			if ($current?.args) clui.select(clui.filter($value)[selection]?.name);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selection--;
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			selection++;
		}

		if ($current?.commands)
		selection = selection >= Object.keys(clui.filter($value)).length ? Object.keys(clui.filter($value)).length - 1 : selection;
		else if ($current?.args)
		selection = selection >= clui.filter($value).length ? clui.filter($value).length - 1 : selection;
		
		selection = selection < 0 ? 0 : selection;
	};
</script>

<svelte:window on:error={(err)=>new clui.Toast(err.message, 'red')} />

<div class="clui-toasts">
	{#each $store.toasts as toast}
		<div class="clui-toast clui-toast-{toast.color}" in:fly={{x: 200, duration: 500}} out:fade={{duration: 300}}>{toast.msg}</div>
	{/each}
</div>

<div class="clui-cli">
	<div class="clui-cli-input">
		<img src="icons/cli.png" alt="" class="clui-cli-icon">
		{#if $store?.tokens}
			<div class="clui-cli-autocomplete">{$store?.tokens.slice(0, $store.depth + $store.argDepth).join(' ')}</div>
		{/if}
		<input type="text" placeholder="enter a command" bind:value={$value} on:input={parse} on:keydown={keydown}>
		{#if $current?.run}
			<button class="clui-cli-run" on:click={clui.execute($value)}>run</button>
		{/if}
		{#if $value}
			<button class="clui-cli-run" on:click={() => {$value = ''; parse()}}>x</button>
		{/if}
	</div>

	<div class="clui-cli-dropdown">
		{#if $current?.commands}
			{#each Object.keys(clui.filter($value)) as command, i}
				<div class="clui-dropdown-item {i === selection ? 'clui-selected' : ''}"	on:click={()=>clui.select(command)} on:mouseover={()=>hover(i)}>
					<span class="clui-dropdown-name">{command}</span>
					<span class="clui-dropdown-description">{$current.commands[command]?.desc}</span>
				</div>
			{/each}
		{:else if $current?.args}
			{#each clui.filter($value) as argument, i}
				<div class="clui-dropdown-item {i === selection ? 'clui-selected' : ''}" on:mouseover={()=>hover(i)} on:click={()=>clui.select(argument.name)}>
					<span class="clui-dropdown-name">{(argument.short ? argument.short + ', ' : '') + argument.name}</span>
					<span class="clui-dropdown-description">{argument?.desc}</span>
				</div>
			{/each}
		{/if}
	</div>

	<div class="clui-pages">
		{#each $store.pages as page}
			<div class="clui-page-container" in:slide={{duration: 200}} out:slide={{duration: 200}}>
				<div class="clui-page-buttons">
					<button on:click={page.close()}>X</button>
				</div>
				<div class="clui-page">{page.isForm}</div>
			</div>
		{/each}
	</div>
</div>


<style>
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
		border-radius: 3px;
		background-color: hsl(225, 35%, 36%);
		color: var(--text-light);
	}
	.clui-toast-red {
		background-color: hsl(0, 70%, 40%);
	}
	.clui-toast-yellow {
		background-color: hsl(50, 70%, 40%);
	}
	.clui-toast-green {
		background-color: hsl(100, 70%, 40%);
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
		/* margin-left: -0.9rem; */
		/* width: 40vw; */
		border-radius: 3px 3px 0 0;
		background-color: var(--dark);
		border: 2px solid var(--medium);
	}

	.clui-cli-input > .clui-cli-icon {
		/* margin: auto; */
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

		/* padding: 0.6rem 1.2rem; */
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
		padding: 0 0.2rem;
		margin: 0 0.4rem;
		border: none;
		border-radius: 2px;
		background-color: transparent;
		font: inherit;
		color: var(--text-medium);
		cursor: pointer;
		outline: 2px solid var(--light);
	}
	.clui-cli-run:hover {
		color: var(--text-light);
		background-color: var(--light);
	}

	.clui-cli-dropdown {
		min-width: 40vw;
		max-width: 60vw;
		border-radius: 0 0 3px 3px;
	}

	.clui-dropdown-item {
		padding: 0.6rem 1.2rem;
		padding-left: 2.2rem;
		border-radius: 3px;
		z-index: 1;
		position: relative;
	}
	.clui-dropdown-item.clui-selected {
		background-color: var(--light);
		color: var(--text-light);
		cursor: pointer;
		background-color: var(--medium);
		outline: 2px solid var(--light);
	}

	.clui-dropdown-name {
		margin-right: 0.3rem;
		margin-left: -0.5rem;
		padding: 0.3rem 0.5rem;
		border-radius: 3px;
		border: 2px solid var(--light);
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
		justify-content: right;
	}

	.clui-page-buttons > button {
		padding: 0.3rem 0.5rem;
		border-radius: 3px;
		background-color: transparent;
		border: 2px solid var(--medium);
		color: var(--text-medium);
		cursor: pointer;
	}
	.clui-page-buttons > button:hover {
		color: var(--text-light);
		background-color: var(--light);
		border: 2px solid var(--light);
	}

	.clui-page {
		display: flex;
		flex-direction: column;
		background-color: var(--dark);
		border: 2px solid var(--medium);
		border-radius: 3px;
		padding: 0.6rem 1.2rem;
		width: 100%;
		margin: 0.2rem 0;
	}
</style>