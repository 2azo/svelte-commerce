<style>
.text-rem {
	font-size: 0.6rem;
}
</style>

<script>
// import productNonVeg from '$lib/assets/product/non-veg.png'
// import productVeg from '$lib/assets/product/veg.png'
import { AnimatedCartItem, LazyImg } from '$lib/components'
import { applyAction, enhance } from '$app/forms'
import { browser } from '$app/environment'
import { currency, toast } from '$lib/utils'
import { fade } from 'svelte/transition'
import { fireGTagEvent } from '$lib/utils/gTagB'
import { goto, invalidateAll } from '$app/navigation'
import { onMount } from 'svelte'
import { page } from '$app/stores'
import { storeStore } from '$lib/store/store'
import { updateCartStore } from '$lib/store/cart'
import { updateWishlistStore } from '$lib/store/wishlist'

export let product = {}
$: reactiveProductObject = product

let newProduct = {}
let store = {}

onMount(() => {
	if (browser) {
		storeStore.subscribe((value) => (store = value))
	}
	if (product?._source) {
		newProduct = product?._source
		newProduct._id = product?._id
	} else {
		newProduct = product
	}
})

let bounceItemFromTop = false
let cartButtonText = 'Add to Bag'
let customizedImg
let isWislisted = false
let loadingForWishlist = false
let selectedLinkiedProducts = []
let selectedOptions1 = []
let show

function showitems() {
	show = true
}

function hideitems() {
	show = false
}

// async function toggleWishlist(id) {
// 	if (!$page.data.me) {
// 		goto(`${$page.data.loginUrl || '/auth/login'}?ref=/my/wishlist/add/${id}`)
// 		return
// 	}

// 	try {
// 		loadingForWishlist = true

// 		isWislisted = await post(
// 			`wishlists/toggle`,
// 			{ product: id, variant: id, store: $page.data.storeId },
// 			$page.data.origin
// 		)

// 		toast('Added to wishlist successfully', 'success')
// 	} catch (e) {
// 		toast(e, 'error')
// 	} finally {
// 		loadingForWishlist = false
// 	}
// }
</script>

<div
	class="relative col-span-1 flex flex-col items-center justify-center text-center w-full overflow-hidden sm:w-[200px] sm:shrink-0"
	on:mouseenter="{showitems}"
	on:mouseleave="{hideitems}"
	role="group">
	<!-- New and Tags -->

	{#if newProduct.new || newProduct.tags?.length}
		<div class="absolute top-0 left-0 flex flex-col gap-0.5">
			{#if newProduct.new}
				<div
					class="text-rem max-w-max bg-red-500 py-0.5 px-1.5 text-xs font-semibold uppercase text-white">
					New
				</div>
			{/if}

			{#if newProduct.tags?.length}
				{#each newProduct.tags as tag}
					{#if tag?.name && tag?.type === 'Ribbon'}
						<div
							class="text-rem max-w-max py-0.5 px-1.5 text-xs font-semibold uppercase text-white"
							style="background-color: {tag.colorCode};">
							{tag.name}
						</div>
					{/if}
				{/each}
			{/if}
		</div>
	{/if}

	<!-- Product image -->

	<a
		href="/product/{newProduct.slug}"
		rel="noopener noreferrer"
		aria-label="Click to view the product details"
		data-sveltekit-preload-data="tap"
		class="block">
		<LazyImg
			src="{newProduct.img}"
			alt="{newProduct.name}"
			width="200"
			height="200"
			aspect_ratio="1:1"
			class="object-contain object-bottom w-[200px] h-[200px] text-xs" />
	</a>

	{#if show}
		<div
			transition:fade="{{ duration: 300 }}"
			class="absolute inset-x-0 top-[163px] bg-white border-b border-l border-r">
			<ul class="bg-white grid grid-cols-4 divide-x divide-secondary-500 p-2">
				<!-- Cart -->

				<li class="flex items-center justify-center">
					<form
						action="/cart?/add"
						method="POST"
						use:enhance="{() => {
							return async ({ result }) => {
								updateCartStore({ data: result.data })
								result?.data?.qty < 0
									? fireGTagEvent('remove_from_cart', result?.data)
									: fireGTagEvent('add_to_cart', result?.data)
								cartButtonText = 'Added To Cart'
								bounceItemFromTop = true
								setTimeout(() => {
									bounceItemFromTop = false
								}, 3000)
								cartButtonText = 'Go to cart'
								// await invalidateAll()
								await applyAction(result)
							}
						}}">
						<input type="hidden" name="pid" value="{product?._id || product?.id || null}" />
						<input type="hidden" name="vid" value="{product?._id || product?.id || null}" />
						<input
							type="hidden"
							name="linkedItems"
							value="{JSON.stringify(selectedLinkiedProducts) || null}" />
						<input type="hidden" name="qty" value="{1}" />
						<input
							type="hidden"
							name="options"
							value="{JSON.stringify(selectedOptions1) || null}" />
						<input type="hidden" name="customizedImg" value="{customizedImg || null}" />

						<button
							type="submit"
							class="block transition duration-300 focus:outline-none
							{cartButtonText !== 'Add to Bag' ? 'text-secondary-500' : 'hover:text-secondary-500'}">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="w-5 h-5">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
								></path>
							</svg>
						</button>
					</form>
				</li>

				<!-- Wishlist -->

				<li class="flex items-center justify-center">
					<form
						id="toggle_wishlist_1"
						action="/my/wishlist?/toggleWishlist2"
						method="POST"
						enctype="multipart/form-data"
						title="save"
						class="block transition duration-300 focus:outline-none"
						use:enhance="{() => {
							return async ({ result }) => {
								// console.log('wishlist toggle result', result)

								if (result?.type === 'redirect') {
									goto(result?.location)
								} else if (result?.data) {
									// toast('Product added to the wishlist successfully', 'success')
									const wishlistRes = result?.data?.wishlistData

									// console.log('wishlistRes', wishlistRes)

									await updateWishlistStore(wishlistRes)
									// await verifyCartAndWishlist()
									// await invalidateAll()
								} else if (result?.error) {
									toast(result?.error?.message, 'error')
								}

								await applyAction(result)
							}
						}}">
						<input type="hidden" name="pid" value="{product?._id || product?.id || null}" />

						<input type="hidden" name="vid" value="{product?._id || product?.id || null}" />

						<button type="submit" aria-label="wishlist" class="max-w-max">
							{#if reactiveProductObject.isWishlisted}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5 shrink-0 text-red-500"
									viewBox="0 0 20 20"
									fill="currentColor">
									<path
										fill-rule="evenodd"
										d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
										clip-rule="evenodd"></path>
								</svg>
							{:else}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1"
									stroke="currentColor"
									class="w-5 h-5 shrink-0 group-hover:text-red-500">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
									></path>
								</svg>
							{/if}
						</button>
					</form>
				</li>

				<!-- Details -->

				<li class="flex items-center justify-center">
					<a
						href="/product/{newProduct.slug}"
						rel="noopener noreferrer"
						aria-label="Click to view the product details"
						data-sveltekit-preload-data="tap"
						class="block hover:text-secondary-500 transition duration-300 focus:outline-none">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-5 h-5">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
							></path>
						</svg>
					</a>
				</li>

				<!-- Search -->

				<li class="flex items-center justify-center">
					<button
						type="button"
						class="block hover:text-secondary-500 transition duration-300 focus:outline-none">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-5 h-5">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
							></path>
						</svg>
					</button>
				</li>
			</ul>
		</div>
	{/if}

	<!-- Product name and prices -->

	<div class="p-2">
		<p class="text-sm line-clamp-2">
			{newProduct.name || '_'}
		</p>

		<div
			class="{store?.isSecureCatalogue && !$page.data?.me ? 'hidden' : 'flex'}
			mt-1 flex-wrap items-baseline justify-center gap-1 text-xs">
			<span class="whitespace-nowrap text-sm font-bold sm:text-base">
				{currency(newProduct.price, store?.currencySymbol)}
			</span>

			{#if newProduct.mrp > newProduct.price}
				<span class="whitespace-nowrap text-zinc-500 line-through">
					{currency(newProduct.mrp, store?.currencySymbol)}
				</span>

				{#if Math.floor(((newProduct.mrp - newProduct.price) / newProduct.mrp) * 100) > 0}
					<span class="whitespace-nowrap text-orange-500 sm:text-zinc-900">
						({Math.floor(((newProduct.mrp - newProduct.price) / newProduct.mrp) * 100)}% off)
					</span>
				{/if}
			{/if}
		</div>

		<!-- Out of Stock -->

		{#if !newProduct.hasStock}
			<p class="absolute inset-x-0 top-[12.5rem] text-center text-xs text-red-600">Out of Stock</p>
		{/if}
	</div>
</div>

{#if bounceItemFromTop}
	<AnimatedCartItem img="{customizedImg || product?.img}" />
{/if}
