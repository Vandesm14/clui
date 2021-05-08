<script lang='ts'>
	import type * as types from "../clui.types";
	export let arg: types.Arg;
	
	if (arg.type === 'string') arg.value = arg.value || '';
	else if (arg.type === 'boolean') arg.value = arg.value || false;

	let value = arg.value;
</script>

{#if arg?.type === 'string'}
	<div class="ciui-page-item">
		<label for=""><span>{arg.name}:</span> {arg.type}</label>
		<input type="text" required={arg.required} bind:value class={value === '' ? 'clui-empty' : ''}>
	</div>
{:else if arg?.type === 'number'}
	<div class="ciui-page-item">
		<label for=""><span>{arg.name}:</span> {arg.type}</label>
		<input type="number" required={arg.required} bind:value class={value === '' ? 'clui-empty' : ''}>
	</div>
{:else if arg?.type === 'boolean'}
	<div class="ciui-page-item" style="flex-direction: row">
		<div class="checkbox {value ? 'checked' : ''}" on:click={() => value = !value}></div>
		<input type="checkbox" required={arg.required} bind:checked={value}>
		<label for=""><span>{arg.name}:</span> {arg.type}</label>
	</div>
{:else if arg?.type === 'enum'}
	<div class="ciui-page-item">
		<label for=""><span>{arg.name}:</span> {arg.type}</label>
		<select>
			{#each arg.items as item}
				<option>{item.name}</option>
			{/each}
		</select>
	</div>
{:else if arg?.type === 'button'}
	<div class="ciui-page-item">
		<button on:click={arg.run}>{arg.value}</button>
	</div>
{/if}

<style>
	div {
		display: flex;
		flex-direction: column;
	}

	div > label {
		/* font-size: 1rem; */
		color: var(--text-medium);
	}

	div > label > span {
		/* font-size: 1rem; */
		color: var(--text-light);
	}

	input {
		font: inherit;
		color: var(--text-light);
		padding: 0.4rem 0.6rem;
		outline: none;
		border: 2px solid var(--medium);
		background-color: var(--dark);
	}
	input:placeholder {
		color: var(--text-medium);
	}
	input:focus {
		border: 2px solid var(--light);
		background-color: var(--medium);
	}

	div.checkbox {
		width: 1.4rem;
		height: 1.6rem;
		border-radius: 3px;
		cursor: pointer;
		border: 2px solid var(--light);
		background-color: var(--dark);
		margin-right: 0.4rem;
	}
	div.checkbox.checked::before {
		color: var(--text-light);
		content: 'X';
		text-align: center;
		display: block;
	}
	div.checkbox.checked {
		border: 2px solid var(--light);
		background-color: var(--light);
	}

	input[type="checkbox"] {
		display: none;
	}

	select {
		width: max-content;
	}

	button {
		font: inherit;
		color: var(--text-light);
		padding: 0.4rem 0.6rem;
		outline: none;
		border: 2px solid var(--medium);
		background-color: var(--dark);
		cursor: pointer;
	}
	button:hover {
		border: 2px solid var(--light);
		background-color: var(--medium);
	}
</style>