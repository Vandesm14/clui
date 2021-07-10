import App from './App.svelte';

const app = new App({
	// @ts-expect-error
  target: document.getElementById('clui')
});

export default app;