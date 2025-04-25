import cookie from 'cookie'
import {
	// BIG_COMMERCE_BASE_URL,
	HTTP_ENDPOINT,
	// bigcommerceHeaders,
	// woocommerceHeaders,
	MEDUSAJS_BASE_URL
	// SHOPIFY_BASE_URL
} from '../config'

// import pkg from '@woocommerce/woocommerce-rest-api' // node v-18
// const WooCommerceRestApi = pkg.default // node v-16
// import { WOO_COMMERCE_STORE_LINK, WOO_COMMERCE_KEY, WOO_COMMERCE_SECRET } from '../config'
import { serialize } from '.'

// const WooCommerce = new WooCommerceRestApi({
// 	url: WOO_COMMERCE_STORE_LINK,
// 	consumerKey: WOO_COMMERCE_KEY,
// 	consumerSecret: WOO_COMMERCE_SECRET,
// 	version: 'wc/v3'
// })

export async function postt(endpoint: string, data: any, ck?: any) {
	try {
		// ck need to be passed, because ck.set is used later bellow
		const ep = HTTP_ENDPOINT + '/api/' + endpoint
		const response: any = await fetch(ep, {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify(data || {}),
			headers: {
				'Content-Type': 'application/json',
				cookie: `connect.sid=${ck.get('connect.sid')}`
			}
		})
		const sid: string | null = response.headers.get('set-cookie')
		if (sid) {
			const sidCookie: any = cookie.parse(sid)
			ck.set('connect.sid', sidCookie['connect.sid'], {
				path: '/'
			})
		}
		const isJson = response.headers.get('content-type')?.includes('application/json')

		const res = isJson ? await response.json() : await response.text()
		if (res?.status > 399) {
			throw { status: res.status, message: res }
		} else if (response?.status > 399) {
			throw { status: response.status, message: res }
		} else {
			return res
		}
	} catch (e) {
		// console.log(`/lib/utils/server.ts postt(${HTTP_ENDPOINT + '/api/' + endpoint})`, e)
		throw e
	}
}

export const delBySid = async (endpoint: string, sid?: any) => {
	try {
		const response = await fetch(HTTP_ENDPOINT + '/api/' + endpoint, {
			method: 'DELETE',
			credentials: 'include',
			headers: { cookie: `connect.sid=${sid}` }
		})
		const isJson = response.headers.get('content-type')?.includes('application/json')
		const res = isJson ? await response.json() : await response.text()
		if (response?.status > 399) {
			throw { status: response.status, message: response.statusText }
		} else {
			return res
		}
	} catch (e) {
		// console.log(`/lib/utils/server.ts delBySid(${HTTP_ENDPOINT + '/api/' + endpoint})`, e)
		throw e
	}
}

export async function postBySid(endpoint: string, data: any, sid?: string) {
	// try {
	const ep = HTTP_ENDPOINT + '/api/' + endpoint
	const response = await fetch(ep, {
		method: 'POST',
		credentials: 'include',
		body: JSON.stringify(data || {}),
		headers: {
			'Content-Type': 'application/json',
			cookie: `connect.sid=${sid}`
		}
	})
	if (endpoint.includes('logout')) return true
	const isJson = response.headers.get('content-type')?.includes('application/json')
	const res = isJson ? await response.json() : await response.text()
	if (res?.status > 399) {
		throw { status: res.status, message: res }
	} else if (response?.status > 399) {
		throw { status: response.status, message: res }
	} else {
		const setCookieForLogin = response.headers.get('set-cookie')
		if (setCookieForLogin) {
			const sidCookie = cookie.parse(setCookieForLogin)
			if (typeof res === 'object' && res !== null) {
				res.sid = sidCookie['connect.sid']
			}
		}
		return res
	}
	// } catch (e) {
	// 	// console.log(`/lib/utils/server.ts postBySid(${HTTP_ENDPOINT + '/api/' + endpoint})`, e)
	// 	throw e
	// }
}

export async function gett(endpoint: string, ck?: any) {
	try {
		const ck1 = cookie.parse(ck || '')
		const ep = HTTP_ENDPOINT + '/api/' + endpoint
		const response = await fetch(ep, {
			method: 'GET',
			credentials: 'include',
			headers: { cookie: `connect.sid=${ck1['connect.sid']}` }
		})
		const isJson = response.headers.get('content-type')?.includes('application/json')

		const res = isJson ? await response.json() : await response.text()
		if (res?.status > 399) {
			throw { status: res.status, message: res }
		} else if (response?.status > 399) {
			throw { status: response.status, message: res }
		} else {
			return res
		}
	} catch (e) {
		// console.log(`/lib/utils/server.ts gett(${HTTP_ENDPOINT + '/api/' + endpoint})`, e)
		throw e
	}
}

export const getBySid = async (endpoint: string, sid?: any) => {
	try {
		const response = await fetch(HTTP_ENDPOINT + '/api/' + endpoint, {
			method: 'GET',
			credentials: 'include',
			headers: { cookie: `connect.sid=${sid}` }
		})
		const isJson = response.headers.get('content-type')?.includes('application/json')
		const res = isJson ? await response.json() : await response.text()
		if (response?.status > 399) {
			throw { status: response.status, message: response.statusText }
		} else {
			return res
		}
	} catch (e) {
		// console.log(`/lib/utils/server.ts getByconnect.sidSid(${HTTP_ENDPOINT + '/api/' + endpoint})`, e)
		throw e
	}
}

// ---------------------------------- X ----------------------------------

export const getBigcommerceApi = async (endpoint: string, query?: any, sid?: any) => {
	try {
		const response = await fetch(BIG_COMMERCE_BASE_URL + '/' + endpoint + '?' + serialize(query), {
			headers: bigcommerceHeaders
		})
		const isJson = response.headers.get('content-type')?.includes('application/json')
		const res = isJson ? await response.json() : await response.text()
		if (res?.status > 399) {
			throw { status: res.status, message: res }
		} else if (response?.status > 399) {
			throw { status: response.status, message: res }
		} else {
			return res
		}
	} catch (e) {
		// console.log(`/lib/utils/server.ts getBigcommerceApi(${HTTP_ENDPOINT + '/api/' + endpoint})`, e)
		throw e
	}
}

export const postBigCommerceApi = async (endpoint: string, query: any, sid?: any) => {
	try {
		const response = await fetch(BIG_COMMERCE_BASE_URL + '/' + endpoint + '?' + serialize(query), {
			method: 'POST',
			headers: bigcommerceHeaders
		})

		const isJson = response.headers.get('content-type')?.includes('application/json')
		const res = isJson ? await response.json() : await response.text()
		if (res?.status > 399) {
			throw { status: res.status, message: res }
		} else if (response?.status > 399) {
			throw { status: response.status, message: res }
		} else {
			return res
		}
	} catch (e) {
		// console.log(`/lib/utils/server.ts postBigCommerceApi(${HTTP_ENDPOINT + '/api/' + endpoint})`, e)
		throw e
	}
}

// ---------------------------------- X ----------------------------------

export const getMedusajsApi = async (endpoint: string, query?: any, sid?: any) => {
	try {
		const fullUrl = `${MEDUSAJS_BASE_URL}/${endpoint}`
		console.log('Requesting URL:', fullUrl) // Log the URL
		const response = await fetch(fullUrl, {
			method: 'GET',
			credentials: 'include',
			headers: {
				Cookie: `connect.sid=${sid}`,
				'x-publishable-api-key':
					'pk_fd30032a2deebdebf93cec580fe0288a275d72ff64a016b217257fc0e0481221'
			}
		})
		// console.log('Response Status:', response.status); // Log the status

		const isJson = response.headers.get('content-type')?.includes('application/json')
		const res = await response.text() // Always get text first
		// console.log('Response Body:', res); // Log the raw response

		if (response.status >= 400) {
			throw { status: response.status, message: res }
		}
		return isJson ? JSON.parse(res) : res // Parse JSON only if applicable
	} catch (e) {
		console.log('Error in getMedusajsApi:', e) // Improved error logging
		throw e
	}
}

export const postMedusajsApi = async (endpoint: string, data: any, sid?: any, token?: string) => {
	try {
		console.log('inside postMedusajsApi')

		const ep = MEDUSAJS_BASE_URL + '/' + endpoint;
		// console.log('Requesting URL (ep):', ep);
		// this is just for login auth
		// const ep = 'http://localhost:9000/auth/customer/wohnwert'

		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			'x-publishable-api-key': 'pk_fd30032a2deebdebf93cec580fe0288a275d72ff64a016b217257fc0e0481221'
		}

		if (sid) {
			headers['Cookie'] = `connect.sid=${sid}`
		}
		if (token) {
			headers['Authorization'] = `Bearer ${token}`
		}
		console.log('Request Headers:', headers)
		const response = await fetch(ep, {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify(data || {}),
			headers
		})

		const isJson = response.headers.get('content-type')?.includes('application/json')
		const res = isJson ? await response.json() : await response.text()
		if (response.status > 399) {
			let message = res.message
			if (message == 'null') {
				message = 'Invalid data'
			}
			throw { status: 400, message }
		}
		if (res?.status > 399) {
			throw { status: res.status, message: res.message }
		} else if (response?.status > 399) {
			throw { status: response.status, message: res }
		} else {
			const setCookieForLogin = response.headers.get('set-cookie')
			if (setCookieForLogin) {
				const sidCookie = cookie.parse(setCookieForLogin)
				res.sid = sidCookie['connect.sid']
			}
			return res
		}
	} catch (e) {
		throw e
	}
}

export const deleteMedusajsApi = async (endpoint: string, sid?: any) => {
	try {
		const ep = MEDUSAJS_BASE_URL + '/' + endpoint
		const response = await fetch(ep, {
			method: 'DELETE',
			credentials: 'include',
			headers: {
				Cookie: `connect.sid=${sid}`,
				'x-publishable-api-key':
					'pk_fd30032a2deebdebf93cec580fe0288a275d72ff64a016b217257fc0e0481221'
			}
		})
		const isJson = response.headers.get('content-type')?.includes('application/json')
		const res = isJson ? await response.json() : await response.text()
		if (response?.status > 399) {
			throw { status: response.status, message: response.statusText }
		} else {
			return res
		}
	} catch (e) {
		console.log(`/lib/utils/server.ts delBySid(${MEDUSAJS_BASE_URL + '/' + endpoint})`, e)
		throw e
	}
}

// ---------------------------------- X ----------------------------------

export const getShopifyApi = async (endpoint: string, query: any, sid?: any) => {
	try {
		const response = await fetch(SHOPIFY_BASE_URL + '/' + endpoint, {
			method: 'GET',
			credentials: 'include',
			headers: { Cookie: `connect.sid=${sid}` }
		})
		const isJson = response.headers.get('content-type')?.includes('application/json')
		const res = isJson ? await response.json() : await response.text()
		if (res?.status > 399) {
			throw { status: res.status, message: res }
		} else if (response?.status > 399) {
			throw { status: response.status, message: res }
		} else {
			return res
		}
	} catch (e) {
		// console.log(`/lib/utils/server.ts getShopifyApi(${HTTP_ENDPOINT + '/api/' + endpoint})`, e)
		throw e
	}
}

export const postShopifyApi = async (endpoint: string, data: any, sid?: any) => {
	try {
		const ep = SHOPIFY_BASE_URL + '/' + endpoint
		const response = await fetch(ep, {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify(data || {}),
			headers: {
				'Content-Type': 'application/json',
				cookie: `connect.sid=${sid}`
			}
		})
		const isJson = response.headers.get('content-type')?.includes('application/json')
		const res = isJson ? await response.json() : await response.text()
		if (res?.status > 399) {
			throw { status: res.status, message: res.body.message }
		} else if (response?.status > 399) {
			throw { status: response.status, message: res }
		} else {
			return res
		}
	} catch (e) {
		// console.log(`/lib/utils/server.ts postShopifyApi(${HTTP_ENDPOINT + ' / api /' + endpoint})`, e)
		throw e
	}
}

// ---------------------------------- X ----------------------------------

export const getWoocommerceApi = async (endpoint: string, query?: any, sid?: any) => {
	try {
		// const res = await WooCommerce.get(endpoint + '?' + serialize(query))
		// const response = await fetch(
		// 	`${WOO_COMMERCE_STORE_LINK}/wp-json/wc/v3/${endpoint + '?' + serialize(query)}`,
		// 	{
		// 		headers: woocommerceHeaders
		// 	}
		// )
		// const isJson = response.headers.get('content-type')?.includes('application/json')
		// if (res?.status > 399) {
		// 	throw { status: res.status, message: res }
		// } else {
		// 	return res
		// }
	} catch (e) {
		throw new Error(e)
	}
}

export const postWoocommerceApi = async (endpoint: string, query: any, sid?: any) => {
	try {
		// const res = await WooCommerce.get(endpoint + '?' + serialize(query))
		// const response = await fetch(
		// 	`${WOO_COMMERCE_STORE_LINK}/wp-json/wc/v3/${endpoint + '?' + serialize(query)}`,
		// 	{
		//		method: 'POST',
		// 		headers: woocommerceHeaders
		// 	}
		// )
		// const isJson = response.headers.get('content-type')?.includes('application/json')
		// if (res?.status > 399) {
		// 	throw { status: res.status, message: res }
		// } else {
		// 	return res
		// }
	} catch (e) {
		throw new Error(e)
	}
}
