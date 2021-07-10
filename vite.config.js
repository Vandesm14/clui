import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
	base: '',
	build: {
    lib: {
      entry: 'src/main.ts',
      formats: ['cjs', 'iife'],
      name: 'clui',
      fileName: 'clui'
    },
		assetsDir: '.'
	},
  plugins: [svelte()]
})
