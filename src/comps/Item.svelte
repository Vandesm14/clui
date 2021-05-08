<script lang='ts'>
	import type * as types from "../clui.types";
	export let arg: types.Arg;
	arg.value = arg.value || '';

	let value = arg.value;
</script>

{#if arg?.type === 'string'}
	<div>
		<input type="text" required={arg.required} bind:value class={value === '' ? 'clui-empty' : ''}>
	</div>
{:else if arg?.type === 'number'}
	<div>
		<input type="number" required={arg.required} bind:value class={value === '' ? 'clui-empty' : ''}>
	</div>
{:else if arg?.type === 'boolean'}
	<div>
		<input type="checkbox" value={arg.value} required={arg.required}>
	</div>
{:else if arg?.type === 'enum'}
	<div>
		<select></select>
	</div>
{:else if arg?.type === 'button'}
	<div>
		<button on:click={arg.run}>{arg.value}</button>
	</div>
{/if}

<style>
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
		/* background-color: var(--light); */
		border: 2px solid var(--light);
		background-color: var(--medium);
	}
</style>