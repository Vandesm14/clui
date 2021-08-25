<script lang='ts'>
	import type { Arg } from '../clui';
	import type { OutputItem } from "../lib/runner";

	export let item: OutputItem | Arg;

	if (item?.type === 'string') item.value = item.value || '';
	else if (item?.type === 'boolean') item.value = item.value || false;
</script>

{#if item?.type === 'string'}
	<div class="ciui-page-item">
		<span class="clui-item-label"><span>{item.name}:</span> {item.type} {item.required ? '*' : ''}</span>
		<input type="text" required={item.required} bind:value={item.value} class={item.value === '' ? 'clui-empty' : ''}>
	</div>
{:else if item?.type === 'string_long'}
	<div class="ciui-page-item">
		<span class="clui-item-label"><span>{item.name}:</span> {item.type} {item.required ? '*' : ''}</span>
		<textarea required={item.required} bind:value={item.value} class={item.value === '' ? 'clui-empty' : ''}></textarea>
	</div>
{:else if item?.type === 'number'}
	<div class="ciui-page-item">
		<span class="clui-item-label"><span>{item.name}:</span> {item.type} {item.required ? '*' : ''}</span>
		<input type="number" required={item.required} bind:value={item.value} class={item.value === '' ? 'clui-empty' : ''}>
	</div>
{:else if item?.type === 'boolean'}
	<div class="ciui-page-item" style="flex-direction: row">
		<div class="checkbox {item.value ? 'checked' : ''}" on:click={() => item.value = !item.value}></div>
		<input type="checkbox" required={item.required} bind:checked={item.value}>
		<span class="clui-item-label"><span>{item.name}:</span> {item.type} {item.required ? '*' : ''}</span>
	</div>
<!-- {:else if item?.type === 'enum'}
	<div class="ciui-page-item">
		<span class="clui-item-label"><span>{item.name}:</span> {item.type} {item.required ? '*' : ''}</span>
		<select>
			{#each item.items as item}
				<option>{item.name}</option>
			{/each}
		</select>
	</div> -->
{:else if item?.type === 'button'}
	<div class="ciui-page-item">
		<button on:click={item.run}>{item.name}</button>
	</div>
{:else if item?.type === 'paragraph'}
	<div class="ciui-page-item">
		{#if item.name}
		<h1>{item.name}</h1>
		{/if}
		{#if item.value}
		<p>{@html item.value.replace(/\n/g, '<br>')}</p>
		{/if}
	</div>
{/if}

<style>
	div.ciui-page-item {
		display: flex;
		flex-direction: column;
	}
	div > .clui-item-label {
		color: var(--text-medium);
	}
	div > .clui-item-label > span {
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