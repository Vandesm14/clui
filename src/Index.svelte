<script>
</script>

<div class="clui-cli">
	<div class="clui-cli-input">
		<img src="" alt="" class="clui-cli-icon">
		<div class="clui-cli-autocomplete"></div>
		<input type="text" placeholder="enter a command">
	</div>
	<div class="clui-cli-dropdown">
		{#each Object.keys(clui.commands) as command}
			<div class="clui-dropdown-item">
				<span class="clui-dropdown-name">{command}</span>
				<span class="clui-dropdown-description">{clui.commands[command].description}</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.clui-cli {
		display: flex;
		flex-direction: column;
		width: max-content;
		margin: 4vh auto;
	}

	.clui-cli-input {
		display: flex;
		align-items: middle;
		background-color: var(--medium);
	}

	.clui-cli-input > input {
		background-color: var(--medium);
		color: white;
		border: none;
		outline: none;
		font-size: 1.2rem;
		padding: 0.5rem 1rem;
		font-family: Calibri, sans-serif;
		width: 30vw;
	}

	.clui-cli-dropdown {
		background-color: var(--medium);
		color: white;
		font-size: 1.2rem;
	}

	.clui-dropdown-item {
		padding: 0.6rem 1.2rem;
	}
	.clui-dropdown-item:hover, .clui-dropdown-item.clui-selected {
		background-color: var(--light);
		cursor: pointer;
	}

	.clui-dropdown-name {
		background-color: var(--light);
		padding: 0.3rem 0.5rem;
		margin-left: -0.6rem;
		margin-right: 0.3rem;
	}
</style>