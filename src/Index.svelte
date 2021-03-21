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
		align-items: center;
		background-color: var(--medium);
		border-radius: 3px 3px 0 0;
		width: 40vw;
	}

	.clui-cli-input > input {
		background-color: transparent;
		color: var(--text-light);
		border: none;
		outline: none;
		font-size: inherit;
		padding: 0.6rem 1.2rem;
		font-family: Calibri, sans-serif;
		flex: 1;
	}
	.clui-cli-input > input::placeholder {
		color: var(--text-medium);
	}

	.clui-cli-dropdown {
		background-color: var(--medium);
		border-radius: 0 0 3px 3px;
		width: 40vw;
	}

	.clui-dropdown-item {
		padding: 0.6rem 1.2rem;
		border-radius: 3px;
	}
	.clui-dropdown-item:hover, .clui-dropdown-item.clui-selected {
		background-color: var(--light);
		cursor: pointer;
		color: var(--text-light);
	}

	.clui-dropdown-name {
		background-color: var(--light);
		padding: 0.3rem 0.5rem;
		margin-left: -0.5rem;
		margin-right: 0.3rem;
		border-radius: 3px;
	}
</style>