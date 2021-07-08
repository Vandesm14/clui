import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
	base: '',
	build: {
		assetsDir: '.',
		rollupOptions: {
			output: {
				manualChunks: ()=>'hello.js'
			}
		}
	},
  plugins: [svelte()]
})
