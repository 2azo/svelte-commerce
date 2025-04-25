import { error, fail } from '@sveltejs/kit'
import { z } from 'zod'
import { UserService } from '$lib/services'

const zodEmailLoginSchema = z.object({
	email: z
		.string({ required_error: 'Email is required' })
		.email({ message: 'Email must be a valid email address' }),
	password: z.string({ required_error: 'Password is required' })
})

const zodPhoneLoginSchema = z.object({
	phone: z
		.string({ required_error: 'Phone is required' })
		.min(10, { message: 'Phone must be at least 10 digits' })
		.max(17, { message: 'Phone must be less then 17 digits' })
})

const login = async ({ request, cookies, locals }) => {
	const data = await request.formData();
	const isEmail = data.get('isEmail');
	const phoneOrEmail = data.get('phoneOrEmail');
	const password = data.get('password');
	let res;
  
	if (isEmail == 'true') {
	  try {
		console.log('down are inputs for LoginService', isEmail);
		console.log('phoneOrEmail', phoneOrEmail);
		console.log('password', password);
		console.log('locals.cartId', locals.cartId);
		console.log('locals.storeId', locals.storeId);
		console.log('locals.origin', locals.origin);
		console.log('cookies.get(connect.sid)', cookies.get('connect.sid'));
		res = await UserService.loginService({
		  handle: phoneOrEmail,
		  password: password,
		  cartId: locals.cartId,
		  storeId: locals.storeId,
		  origin: locals.origin,
		  server: true,
		//   sid: cookies.get('connect.sid')
		});
	  } catch (e) {
		console.log('Error from login:', e);
		throw error(e.status || 401, e.message || 'Login failed');
	  }
	} else {
	  const formData = { phone: phoneOrEmail };
	  try {
		zodPhoneLoginSchema.parse(formData);
	  } catch (err) {
		const { fieldErrors: errors } = err.flatten();
		const { ...rest } = formData;
		throw error(404, { data: rest, errors });
	  }
	  try {
		res = await UserService.getOtpService({
		  phone: phoneOrEmail,
		  storeId: locals.storeId,
		  server: true,
		  origin: locals.origin
		});
	  } catch (e) {
		throw error(401, e.message);
	  }
	}
  
	// Store the token in a cookie for frontend use
	if (res.token) {
	  cookies.set('auth_token', res.token, { path: '/', httpOnly: true, secure: true });
	}
  
	// Optional: Set connect.sid if present (though not needed for token-based auth)
	if (res.sid) {
	  cookies.set('connect.sid', res.sid, { path: '/', httpOnly: true, secure: true });
	}
  
	return res;
  };

const verifyOtp = async ({ cookies, request, locals, url }) => {
	const data = await request.formData()
	const otp = data.get('otp')
	const phone = data.get('phone')

	if (typeof phone !== 'string' || !phone) {
		return fail(400, { invalid: true })
	}

	if (typeof otp !== 'string' || !otp) {
		return fail(400, { invalid: true })
	}
	try {
		const user = await UserService.verifyOtpService({
			phone,
			otp,
			cartId: cookies.get('cartId'),
			origin: locals.origin,
			sid: locals.sid,
			storeId: locals.storeId
		})

		if (!user) {
			return fail(400, { credentials: true })
		}

		const me = {
			id: user._id,
			email: user.email,
			phone: user.phone,
			firstName: user.firstName,
			lastName: user.lastName,
			avatar: user.avatar,
			role: user.role,
			verified: user.verified,
			active: user.active,
			store: user.store
		}

		cookies.set('connect.sid', user.sid, { path: '/' })

		cookies.set('me', JSON.stringify(me), {
			path: '/',
			maxAge: 31536000
			// httpOnly: true,
			// sameSite: 'strict',
			// secure: process.env.NODE_ENV === 'production'
		})

		return me
	} catch (e) {
		return fail(e.status, { message: e.body?.message, credentials: true })
	}
}

export const actions = { login, verifyOtp }
