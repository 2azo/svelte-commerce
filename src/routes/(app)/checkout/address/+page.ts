import { error, redirect } from '@sveltejs/kit'
import { AddressService, CartService, CountryService } from '$lib/services'

export const prerender = false

export async function load({ url, parent }) {
	const { me, sid, store, storeId, origin, cartId, token} = await parent()

	console.log('inside +page.server.ts, loaded data')
	console.log('me -> ', me)
	console.log('sid -> ', sid)
	console.log('store -> ', store)
	console.log('storeId -> ', storeId)
	console.log('origin -> ', origin)
	console.log('cartId -> ', cartId)
	console.log('last man standing token -> ', token)

	try {
		const currentPage = +url.searchParams.get('page') || 1
		const q = url.searchParams.get('q') || ''
		let err

		const [cart, countries] = await Promise.all([
			CartService.fetchRefreshCart({
				cartId,
				origin,
				sid,
				storeId
			}),
			CountryService.fetchCountries({
				storeId,
				origin,
				sid
			})
		])

		if (!cart?.qty) {
			redirect(307, '/cart')
		}

		if (store?.isGuestCheckout) {
			if (me) {
				console.log("inside fetchAddresses linke 34, fetch inputs")
				console.log('storeId', storeId)
				console.log('origin', origin)
				console.log('sid', sid)
				const { myAddresses, preSelectedAddress } = await AddressService.fetchAddresses({
					storeId,
					origin,
					sid,
					token 
				})

				return {
					cart,
					countries,
					currentPage,
					err,
					myAddresses,
					q,
					preSelectedAddress,
					url: url.href
				}
			} else {
				return {
					cart,
					countries,
					currentPage,
					err,
					q,
					url: url.href
				}
			}
		} else {
			if (!me) {
				redirect(307, `/auth/login?ref=${url?.pathname}`)
			} else {
				console.log("inside fetchAddresses linke 68, fetch inputs")

				const { myAddresses, preSelectedAddress } = await AddressService.fetchAddresses({
					storeId,
					origin,
					sid,
					token
				})

				return {
					cart,
					countries,
					currentPage,
					err,
					myAddresses,
					q,
					preSelectedAddress,
					url: url.href
				}
			}
		}
	} catch (e) {
		if (e.status === 307 && e.location === '/cart') {
			redirect(307, '/cart')
		} else if (e.status === 401 || e.status === 307) {
			redirect(307, `/auth/login?ref=${url?.pathname}`)
		} else {
			error(500, e?.message)
		}
	}
}
