import { deleteMedusajsApi, getMedusajsApi, postMedusajsApi } from '$lib/utils/server'
import { error } from '@sveltejs/kit'

export const fetchMeData = async ({ origin, storeId, server = false, cookies }: any) => {
	try {
		let res: any = {}

		const sid = cookies.get('connect.sid')
		// console.log(sid)
		console.log("inside fetchMeData")
		const response = await getMedusajsApi(`customers/me`, null, sid)
		const customerResponse = response.customer

		res.firstName = customerResponse.first_name
		res.lastName = customerResponse.last_name
		res.active = customerResponse.has_account
		res.id = customerResponse.id

		return res || {}
	} catch (e) {
		error(e.status, e.message)
	}
}

export const signupService = async ({
	firstName,
	lastName,
	phone,
	email,
	password,
	passwordConfirmation,
	storeId,
	origin,
	server = false,
	sid = null
}: any) => {
	try {
		let res: any = {}

		const response = await postMedusajsApi(`customers`, {
			first_name: firstName,
			last_name: lastName,
			phone,
			email,
			password
		})
		res = response.customer
		res.firstName = res.first_name
		res.lastName = res.last_name
		res.active = res.has_account

		return res
	} catch (e) {
		error(e.status, e.message)
	}
}

export const loginService = async ({
	handle,
	password,
	cartId = null,
	storeId,
	origin,
	server = false,
	sid = null
}: any) => {
	try {
		let res: any = {}

		// Authenticate or create customer with wohnwert provider
		const authResponse = await postMedusajsApi(
			'auth/customer/wohnwert',
			{
				handle,
				password
			},
			{
				isAuth: true
			}
		)
		console.log('Auth response:', authResponse)

		// Extract the token from the response
		let token = authResponse.token
		if (!token) {
			throw { status: 401, message: 'Authentication failed: No token returned' }
		}

		// Refresh the token to ensure customer data is included
		try {
			const refreshResponse = await fetch('http://localhost:9000/auth/token/refresh', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
					'x-publishable-api-key':
						'pk_fd30032a2deebdebf93cec580fe0288a275d72ff64a016b217257fc0e0481221'
				}
			})
			const refreshData = await refreshResponse.json()
			if (refreshResponse.status > 399) {
				console.warn('Token refresh failed:', refreshData.message || 'Unknown error')
			} else if (refreshData.token) {
				token = refreshData.token // Update token with refreshed one
				console.log('Token refreshed successfully:', token)
			}
		} catch (e) {
			console.warn('Error during token refresh:', e.message)
		}

		// Use the token to fetch customer data
		const customerResponse = await fetch('http://localhost:9000/store/customers/me', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
				'x-publishable-api-key':
					'pk_fd30032a2deebdebf93cec580fe0288a275d72ff64a016b217257fc0e0481221',
				'Content-Type': 'application/json'
			}
		})
		console.log('Customer response status:', customerResponse.status)

		const customerData = await customerResponse.json()
		console.log('Customer data --> ', customerData)
		if (customerResponse.status > 399) {
			throw {
				status: customerResponse.status,
				message: customerData.message || 'Failed to retrieve customer data'
			}
		}

		// Map customer data to expected format
		res = customerData.customer || {}
		res.firstName = res.first_name || ''
		res.lastName = res.last_name || ''
		res.active = res.has_account || false
		res.token = token 

		// Create or update cart with customer ID
		if (!cartId && res?.id) {
			try {
				const cartResponse = await postMedusajsApi('carts', {}, { token })
				cartId = cartResponse.cart?.id
				console.log('Created new cart with ID:', cartId)
			} catch (e) {
				console.log('Failed to create new cart:', e)
			}
		}

		if (cartId && res?.id) {
			try {
				await postMedusajsApi(`carts/${cartId}`, {  email: res.email  }, { token })
				console.log('Cart updated with customer ID:', res.id)
			} catch (e) {
				console.log('Failed to update cart with customer_id:', e)
				console.log('Cart ID:', cartId)
				console.log('Customer ID:', res.id)
				console.log('Token:', token)
			}
		}

		res.cartId = cartId 
		return res
	} catch (e) {
		if (e.status === 401) e.message = 'Handle or password is invalid'
		throw { status: e.status || 500, message: e.message || 'Login failed' }
	}
}

export const forgotPasswordService = async ({
	email,
	referrer,
	storeId,
	origin,
	server = false,
	sid = null
}: any) => {
	try {
		let res: any = {}

		res = await postMedusajsApi(`customers`, {})

		return res
	} catch (e) {
		error(e.status, e.message)
	}
}

export const changePasswordService = async ({
	oldPassword,
	password,
	passwordConfirmation,
	storeId,
	origin,
	server = false,
	sid = null
}: any) => {
	try {
		let res: any = {}

		res = await postMedusajsApi(`customers/me`, {})

		return res
	} catch (e) {
		error(e.status, e.message)
	}
}

export const getOtpService = async ({
	firstName,
	lastName,
	phone,
	email,
	password,
	passwordConfirmation,
	storeId,
	origin,
	server = false,
	sid = null
}: any) => {
	try {
		let res: any = {}

		res = {} // await postMedusajsApi(`customers`, {})

		return res
	} catch (e) {
		error(e.status, e.message)
	}
}

export const verifyOtpService = async ({
	phone,
	otp,
	storeId,
	origin,
	server = false,
	sid = null
}: any) => {
	try {
		let res: any = {}

		res = await postMedusajsApi(`customers`, {})

		return res
	} catch (e) {
		error(e.status, e.message)
	}
}

export const logoutService = async ({ storeId, origin, server = false, sid = null }: any) => {
	try {
		let res: any = {}

		res = await deleteMedusajsApi(`auth`, sid)

		return res
	} catch (e) {
		error(e.status, e.message)
	}
}

export const updateProfileService = async ({
	storeId,
	e,
	origin,
	server = false,
	sid = null
}: any) => {
	try {
		console.log("updateProfileService")
		let res: any = {}

		res = await getMedusajsApi(`customers/me`, {}, sid)

		return res
	} catch (e) {
		error(e.status, e.message)
	}
}
