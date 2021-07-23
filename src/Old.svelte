<!-- <svelte:window on:error={(err)=>new clui.Toast(err.message, 'red')} /> -->
	<div class="clui-toasts">
		{#each $store.toasts as toast (toast.id)}
			<div class="clui-toast clui-toast-{toast.color}" in:fly={{x: 200, duration: 500}} out:slide={{duration: 300}}>{toast.msg}</div>
		{/each}
	</div>
	<div class="clui-cli">
		<div class="clui-cli-input">
			<img src="icons/cli.png" alt="" class="clui-cli-icon">
			{#if $store?.tokens}
				<div class="clui-cli-autocomplete">
					{$store.tokens.slice(0, $store.depth + $store.argDepth).join(' ')} {' '} {$current?.commands ? clui.filter($value)[selection]?.name ?? '' : ''}
				</div>
			{/if}
			<input type="text" placeholder={''} bind:value={$value} on:input={parse} on:keydown={keydown}>
			{#if $current?.run}
				<button class="clui-cli-run" on:click={execute}>{$store.canRun ? 'run' : 'form'}</button>
			{/if}
			{#if $value}
				<button class="clui-cli-run" on:click={clear}>x</button>
			{/if}
		</div>
		<div class="clui-cli-dropdown">
			{#if $current?.commands}
				{#each clui.filter($value) as command, i}
					{#if $store.divider > 0 && i === $store.divider}
						<hr>
					{/if}
					<div class="clui-dropdown-item {i === selection ? 'clui-selected' : ''}"	on:click={()=>clui.select(command.name)} on:mouseover={()=>hover(i)}>
						{#if typeof command.name !== 'number'}
							<span class="clui-dropdown-name">{command.name}</span>
						{/if}
						<span class="clui-dropdown-description">{command.desc}</span>
					</div>
				{/each}
			{:else if $current?.args}
				{#each clui.filter($value) as argument, i}
					{#if $store.divider > 0 && i === $store.divider}
						<hr>
					{/if}
					<div class="clui-dropdown-item {i === selection ? 'clui-selected' : ''}" on:mouseover={()=>hover(i)} on:click={()=>clui.select(argument.name)}>
						<span class="clui-dropdown-name">{(argument.short ? argument.short + ', ' : '') + argument.name + (argument.required ? '*' : '')}</span>
						<span class="clui-dropdown-description">{argument?.desc}</span>
					</div>
				{/each}
			{/if}
		</div>
		<div class="clui-pages">
			{#each $store.pages as page, i (page.id)}
				<div class="clui-page-container" in:slide={{duration: 200}} out:slide={{duration: 200}}>
					<div class="clui-page-buttons">
						<button on:click={page.rerun()}>Rr</button>
						<button on:click={page.reset()}>R</button>
						<button on:click={page.close()}>X</button>
					</div>
					<div class="clui-page">
						{#each $store.pages[i].items as item}
							<Item arg={item} />
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>