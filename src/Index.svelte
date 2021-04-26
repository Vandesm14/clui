<script>
	import clui from './clui.js';
	import {current, value, store} from './stores.js';

	$current = {commands};

	const parse = () => {
		clui.parse($value);
	};
</script>

<div class="clui-cli">
	<div class="clui-cli-input">
		<img src="icons/cli.png" alt="" class="clui-cli-icon">
		<div class="clui-cli-autocomplete">{$store?.tokens.slice(0, $store.depth + $store.argDepth).join(' ')}</div>
		<input type="text" placeholder="enter a command" bind:value={$value} on:input={parse}>
	</div>
	<div class="clui-cli-dropdown">
		{#if $current?.commands}
			{#each Object.keys(clui.filter($value)) as command}
				<div class="clui-dropdown-item" on:click={()=>{clui.select(command)}}>
					<span class="clui-dropdown-name">{command}</span>
					<span class="clui-dropdown-description">{$current.commands[command].description}</span>
				</div>
			{/each}
		{:else if $current?.args}
			{#each clui.filter($value) as argument}
				<div class="clui-dropdown-item">
					<span class="clui-dropdown-name">{(argument.short ? argument.short + ', ' : '') + argument.name}</span>
					<span class="clui-dropdown-description">{argument?.description}</span>
				</div>
			{/each}
		{/if}
	</div>
	<div class="clui-pages"></div>
</div>

<style>
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
	.clui-dropdown-item:hover,
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