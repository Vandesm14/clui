<script lang="ts">
	import CLUI from './clui';

	// @ts-expect-error
	window.clui = new CLUI();
</script>

<div class="cli">
	<div class="input">
		<input type="text" placeholder="Enter a command">
	</div>
	<div class="dropdown">
		<div class="item">Command A</div>
		<div class="item">Command B</div>
	</div>
	<div class="form"></div>
</div>

<style>

</style>