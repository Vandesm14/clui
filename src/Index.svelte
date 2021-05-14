<script>
	import {fade, fly, slide} from 'svelte/transition';
</script>

<h2 in:fade={{duration: 500, delay: 100}}>This <span in:fade={{duration: 500, delay: 600}}>is the</span></h2>

<header in:fade={{duration: 600, delay: 1200}}>
	<div in:slide={{duration: 1000, delay: 1200}}>
		<img src="icons/cli.png" alt="">
		<h1>CLUI</h1>
	</div>
</header>

<main in:fly={{duration: 1000, delay: 1200, y: 200}}>
	<section in:fade={{duration: 600, delay: 1200}} style="flex-direction: column">
		<p in:fade={{duration: 400, delay: 1600}}>
			A unified command system for the web
		</p>
		<div class="row">
			<a href="demo.html" in:fade={{duration: 400, delay: 1800}}>Demo</a>
			<a href="https://github.com/Vandesm14/clui" in:fade={{duration: 400, delay: 1800}}>Source</a>
		</div>
		<!-- <img src="clui-image.png" alt="" in:fade={{duration: 400, delay: 2000}}> -->
		<div id="clui" in:fade={{duration: 400, delay: 2000}}></div>
	</section>
</main>

<style>
h1, h2 {
	text-align: center;
}

h2:first-of-type {
	margin-top: 2rem;
}

.row {
	display: flex;
}

.row > a {
	margin: 0 1rem;
}

header, header > div {
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 3rem;
}

header img {
	display: block;
	height: 1.6em;
	margin-right: 0.4em;
}

main {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 4vh 0;
}

main p {
	width: 40vw;
	text-align: center;
	font-size: 2rem;
}

main img {
	width: clamp(40vw, 50vh, 100vw);
}

main a {
	font-size: 2rem;
}

section {
	display: flex;
	justify-content: center;
	align-items: center;
}
</style>