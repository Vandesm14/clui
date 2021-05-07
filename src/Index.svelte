<script>
	import clui from './clui.js';
	import {fade, fly} from 'svelte/transition';
	import {current, value, store} from './stores.js';

	let selection = 0;

	$current = {commands};

	const parse = () => clui.parse($value);
	const hover = (index) => selection = index;

	const keydown = (e) => {
		if (e.key === 'Enter') {

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
		<div class="clui-cli-autocomplete">{$store?.tokens.slice(0, $store.depth + $store.argDepth).join(' ')}</div>
		<input type="text" placeholder="enter a command" bind:value={$value} on:input={parse} on:keydown={keydown}>
	</div>
	<div class="clui-cli-dropdown">
		{#if $current?.commands}
			{#each Object.keys(clui.filter($value)) as command, i}
				<div class="clui-dropdown-item {i === selection ? 'clui-selected' : ''}"	on:click={()=>clui.select(command)} on:mouseover={()=>hover(i)}>
					<span class="clui-dropdown-name">{command}</span>
					<span class="clui-dropdown-description">{$current.commands[command].description}</span>
				</div>
			{/each}
		{:else if $current?.args}
			{#each clui.filter($value) as argument, i}
				<div class="clui-dropdown-item {i === selection ? 'clui-selected' : ''}" on:mouseover={()=>hover(i)} on:click={()=>clui.select(argument.name)}>
					<span class="clui-dropdown-name">{(argument.short ? argument.short + ', ' : '') + argument.name}</span>
					<span class="clui-dropdown-description">{argument?.description}</span>
				</div>
			{/each}
		{/if}
	</div>
</div>

<div class="clui-pages"></div>

<style>
	.clui-toasts {
	  position: absolute;
	  right: 0;
	  bottom: 0;
	  display: flex;
	  overflow: hidden;
	  flex-direction: column;
	}

	.clui-toasts > .clui-toast {
	  margin: 0.6rem 1.2rem;
	  padding: 0.6rem 1.2rem;
	  border-radius: 3px;
	  background-color: hsl(225, 35%, 36%);
	  color: var(--text-light);
	}
	.clui-toasts > .clui-toast-red {
	  /* border-bottom: 0.4rem solid hsl(0, 70%, 40%); */
	  background-color: hsl(0, 70%, 40%);
	}
	.clui-toasts > .clui-toast-yellow {
	  background-color: hsl(50, 70%, 40%);
	}
	.clui-toasts > .clui-toast-green {
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
	  margin-left: -0.9rem;
	  width: 40vw;
	  border-radius: 3px 3px 0 0;
	}

	.clui-cli-input > .clui-cli-icon {
	  margin: auto;
	  width: 1.6rem;
	  height: 1.6rem;
	}

	.clui-cli-input > .clui-cli-autocomplete {
	  position: absolute;
	  left: 1.8rem;
	  padding: 0 0.2rem;
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

	.clui-cli-dropdown {
	  width: 40vw;
	  border-radius: 0 0 3px 3px;
	}

	.clui-dropdown-item {
	  padding: 0.6rem 1.2rem;
	  border-radius: 3px;
	}
	.clui-dropdown-item.clui-selected {
	  background-color: var(--light);
	  color: var(--text-light);
	  cursor: pointer;
	}

	.clui-dropdown-name {
	  margin-right: 0.3rem;
	  margin-left: -0.5rem;
	  padding: 0.3rem 0.5rem;
	  border-radius: 3px;
	  background-color: var(--light);
	}
</style>