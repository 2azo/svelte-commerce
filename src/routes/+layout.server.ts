import { DOMAIN, HTTP_ENDPOINT } from '$lib/config'

export const load = async ({ locals, url, cookies, fetch }) => {
	const currentPage = +url.searchParams.get('page') || 1
	const q = url.searchParams.get('q') || ''
	const { pathname, host } = url
	locals.currentPage = currentPage
	locals.q = q
	// Can not do it directly from here because it will not cached
	// const res2 = await fetch('/server/store')
	// const storeFromServer = await res2.json()
	// locals.store = storeFromServer.store
	// locals.megamenu = storeFromServer.megamenu
	// locals.menu = storeFromServer.menu
	// locals.popularSearches = storeFromServer.popularSearches

	// Try to get token from cookie
	let token = cookies.get('auth_token')

	// If no token in cookie, fetch it using sid
	if (!token && locals.sid) {
		try {
			const sessionTokenResponse = await fetch('http://localhost:9000/store/session-token', {
				headers: {
					Cookie: `connect.sid=${locals.sid}`,
					'x-publishable-api-key':
						'pk_fd30032a2deebdebf93cec580fe0288a275d72ff64a016b217257fc0e0481221'
				}
			})
			const sessionData = await sessionTokenResponse.json()
			token = sessionData.token
		} catch (e) {
			console.error('Failed to fetch session token:', e)
		}
	}

	console.log('+layout.server.ts: Retrieved token ->', token)
	return { ...locals, pathname, host, q, currentPage, token }
}
