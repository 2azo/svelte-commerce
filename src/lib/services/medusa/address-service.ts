import { deleteMedusajsApi, getMedusajsApi, postMedusajsApi } from '$lib/utils/server'
import { error } from '@sveltejs/kit'

export const fetchAddresses = async ({ origin, storeId, server = false, sid, token }: any) => {
	try {
		let res: any = {}
		let selectedAddress = {}
		let myAddresses = []

		console.log('before fetch in fetchAddresses sid', sid)

		// res = await getMedusajsApi(`customers/me`, {}, sid)
		// res = await getMedusajsApi('customers/me', null, { sid, token });
		res = await getMedusajsApi('customers/me', null, token, sid);
		console.log("res in fetchAddresses", res)
		// myAddresses = res?.customer?.shipping_addresses
		myAddresses = res?.customer?.addresses
		myAddresses.sort((a, b) => {
			const da = new Date(a.updated_at),
				db = new Date(b.updated_at)
			return db - da
		})
		console.log("myAddresses after fetch in fetchAddresses", myAddresses)

		myAddresses = myAddresses.map((add) => {
			return {
				address: add.address_1,
				city: add.city,
				company: add.company,
				country: add.country || add.country_code,
				email: add.email,
				firstName: add.first_name,
				id: add.id || add._id,
				lastName: add.last_name,
				locality: add.address_2,
				phone: add.phone,
				state: add.province,
				zip: add.postal_code
			}
		})

		if (myAddresses?.length) {
			selectedAddress = myAddresses[0]?._id || myAddresses[0]?.id
		}
		return { myAddresses: { data: myAddresses }, selectedAddress, count: res?.count }
	} catch (e) {
		console.error(`getMedusajsApi(${editAddress}) failed:`, e);
		error(e.status, e.message)
	}
}

export const fetchAddress = async ({
	cartId,
	origin,
	storeId,
	server = false,
	sid = null
}: any) => {
	return
}

export const saveAddress = async ({
	id,
	address,
	city,
	company,
	country,
	email,
	firstName,
	lastName,
	locality,
	phone,
	state,
	zip,
	storeId,
	origin,
	sid = null
}: any) => {
	try {
		let res: any = {}
		const addr = {
			address: {
				address_1: address,
				address_2: locality,
				city,
				company,
				country_code: country || 'IN',
				first_name: firstName,
				last_name: lastName,
				phone,
				postal_code: zip,
				province: state
			}
		}
		res = await postMedusajsApi('customers/me/addresses', addr, sid)
		const shipping_addresses = res?.customer?.shipping_addresses
		if (shipping_addresses) {
			return shipping_addresses[0]
		} else {
			error(404, 'Error occured while saving address')
		}
	} catch (err) {
		error(err.status || 400, err.message)
	}
}

export const editAddress = async ({
	id,
	address,
	city,
	company,
	country,
	email,
	firstName,
	lastName,
	locality,
	phone,
	state,
	zip,
	storeId,
	origin,
	sid = null
}: any) => {
	try {
		let res: any = {}
		const addr = {
			address_1: address,
			address_2: locality,
			city,
			company,
			country_code: country || 'IN',
			first_name: firstName,
			last_name: lastName,
			phone,
			postal_code: zip,
			province: state
		}

		res = await postMedusajsApi(`customers/me/addresses/${id}`, addr, sid)

		const shipping_addresses = res?.customer?.shipping_addresses
		if (shipping_addresses) {
			return shipping_addresses[0]
		} else {
			error(404, 'Error occured while saving address')
		}
	} catch (err) {
		error(err.status || 400, err.message)
	}
}

export const deleteAddress = async ({ id, storeId, origin, sid = null }: any) => {
	try {
		deleteMedusajsApi(`customers/me/addresses/${id}`, sid)
	} catch (err) {
		error(err.status || 400, err.message)
	}
}
