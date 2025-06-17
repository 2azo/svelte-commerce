import { DOMAIN, HTTP_ENDPOINT } from '$lib/config'
import { error } from '@sveltejs/kit'

export const prerender = false
// parent: load function of the parent layout
// data: data returned from layout.server.ts
// fetch: fetch function to make HTTP requests
// url: URL object of the current request
export const load = async ({ parent, data, fetch, url }) => {
	console.log('#############################')
	console.log('data beginning of +layout.ts -> ', data)
	console.log('url -> ', url)
	console.log('parent -> ', parent)
	console.log('fetch -> ', fetch)
	console.log('#############################')
	await parent()
	try {
		const res2 = await fetch('/server/store')
		console.log('res2 -> ', res2)
		const storeFromServer = await res2.json()
		console.log('storeFromServer -> ', storeFromServer)
		data.storeId = storeFromServer.store?.id
		data.store = storeFromServer.store
		data.megamenu = storeFromServer.megamenu
		data.menu = storeFromServer.menu
		data.popularSearches = storeFromServer.popularSearches
		data.url = url.pathname
		console.log('#############################')
		console.log('data at end of +layout.ts', data)
		console.log('#############################')
		return { ...data }
	} catch (e) {
		error(
			404,
			`Store Not Found @Layout 
			<br/>ID: ${data.storeId}
			<br/>ORIGIN: ${data.origin}
			<br/>DOMAIN(env): ${DOMAIN}
			<br/>HTTP_ENDPOINT(env): ${HTTP_ENDPOINT}`
		)
	}
}
