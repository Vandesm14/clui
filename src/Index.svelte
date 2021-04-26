<script>
	import clui from './clui.js';
	import {current, value} from './stores.js';

	$current = {commands};

	const parse = () => {
		clui.parse($value);
	};
</script>

<div class="clui-cli">
	<div class="clui-cli-input">
		<img src="" alt="" class="clui-cli-icon">
		<div class="clui-cli-autocomplete"></div>
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
					<span class="clui-dropdown-name">{argument?.name}</span>
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
	  display: flex;
	  align-items: center;
	  width: 40vw;
	  border-radius: 3px 3px 0 0;
	}

	.clui-cli-input > input {
	  flex: 1;
	  padding: 0.6rem 1.2rem;
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