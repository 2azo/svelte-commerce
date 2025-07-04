import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig, loadEnv } from 'vite'
// import { join } from 'path'
// import { partytownVite } from '@builder.io/partytown/utils'
import { SvelteKitPWA } from '@vite-pwa/sveltekit'
/** @type {import('vite').UserConfig} */
export default defineConfig(({ command, mode }) => {
	const env = loadEnv(mode, process.cwd(), '')
	const HTTP_ENDPOINT = env.PUBLIC_MEDUSAJS_API_URL || 'http://localhost:9000'
	return {
		plugins: [
			sveltekit(),
			SvelteKitPWA({
				registerType: 'autoUpdate',
				workbox: {
					globPatterns: ['**/*.{ico,png,svg,webp}']
				},
				srcDir: './src',
				// mode: 'development',
				scope: '/',
				base: '/',
				devOptions: {
					// enabled: true,
					type: 'module',
					navigateFallback: '/'
				},
				// if you have shared info in svelte config file put in a separate module and use it also here
				kit: {}
			})
			// partytownVite({
			// 	dest: join(process.cwd(), 'static', '~partytown')
			// })
		],
		server: {
			allowedHosts: true, // This is required, else will "throw Blocked request. This host ("shopnx.in") is not allowed."
			host: true,
			port: 3000,
			proxy: {
				'/api': HTTP_ENDPOINT,
				'/sitemap': 'https://s3.ap-south-1.amazonaws.com/litekart.in'
			}
		}
	}
})
