<script lang='ts'>
	import type * as types from "../clui.types";
	export let arg: types.Arg;
	
	if (arg.type === 'string') arg.value = arg.value || '';
	else if (arg.type === 'boolean') arg.value = arg.value || false;
</script>

{#if arg?.type === 'string' && arg?.variant !== 'long'}
	<div class="ciui-page-item">
		<span class="clui-item-label"><span>{arg.name}:</span> {arg.type} {arg.required ? '*' : ''}</span>
		<input type="text" required={arg.required} bind:value={arg.value} class={arg.value === '' ? 'clui-empty' : ''}>
	</div>
{:else if arg?.type === 'string' && arg?.variant === 'long'}
	<div class="ciui-page-item">
		<span class="clui-item-label"><span>{arg.name}:</span> {arg.type} {arg.required ? '*' : ''}</span>
		<textarea required={arg.required} bind:value={arg.value} class={arg.value === '' ? 'clui-empty' : ''}></textarea>
	</div>
{:else if arg?.type === 'number'}
	<div class="ciui-page-item">
		<span class="clui-item-label"><span>{arg.name}:</span> {arg.type} {arg.required ? '*' : ''}</span>
		<input type="number" required={arg.required} bind:value={arg.value} class={arg.value === '' ? 'clui-empty' : ''}>
	</div>
{:else if arg?.type === 'boolean'}
	<div class="ciui-page-item" style="flex-direction: row">
		<div class="checkbox {arg.value ? 'checked' : ''}" on:click={() => arg.value = !arg.value}></div>
		<input type="checkbox" required={arg.required} bind:checked={arg.value}>
		<span class="clui-item-label"><span>{arg.name}:</span> {arg.type} {arg.required ? '*' : ''}</span>
	</div>
{:else if arg?.type === 'enum'}
	<div class="ciui-page-item">
		<span class="clui-item-label"><span>{arg.name}:</span> {arg.type} {arg.required ? '*' : ''}</span>
		<select>
			{#each arg.items as item}
				<option>{item.name}</option>
			{/each}
		</select>
	</div>
{:else if arg?.type === 'button'}
	<div class="ciui-page-item">
		<button on:click={arg.run}>{arg.name}</button>
	</div>
{:else if arg?.type === 'paragraph'}
	<div class="ciui-page-item">
		{#if arg.name}
		<h1>{arg.name}</h1>
		{/if}
		{#if arg.value}
		<p>{@html arg.value.replace(/\n/g, '<br>')}</p>
		{/if}
	</div>
{/if}

<style>
	div {
		display: flex;
		flex-direction: column;
	}

	div > .clui-item-label {
		/* font-size: 1rem; */
		color: var(--text-medium);
	}

	div > .clui-item-label > span {
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