<script lang="ts">
import { browser } from '$app/environment'
import {
	CatelogNav,
	DesktopFilter,
	DummyProductCard,
	MobileFilter,
	Pagination,
	ProductCard
} from '$lib/components'
// import { storeStore } from '$lib/store/store'
import { cartStore } from '$lib/store/cart'
import { currency, dateOnly, generatePriceRange, toast } from '$lib/utils'
import { fade, fly } from 'svelte/transition'
import { goto, invalidateAll } from '$app/navigation'
import { onMount } from 'svelte'
import { page } from '$app/stores'
import { PrimaryButton } from '$lib/ui'
import { ProductService } from '$lib/services'
import { sorts } from '$lib/config'
import { wishlistStore } from '$lib/store/wishlist'
import dotsLoading from '$lib/assets/dots-loading.gif'
import noDataAvailable from '$lib/assets/no/no-data-available.png'
import SEO from '$lib/components/SEO/index.svelte'

export let data

let seoProps = {
	brand: $page.data.store?.title,
	breadcrumbs: data.products?.category?.children,
	caption: $page.data.store?.title,
	category: data.products?.category?.name,
	contentUrl: $page.data.store?.logo,
	createdAt: `${data.products?.category?.createdAt || '_'}`,
	email: `${$page.data.store?.email}`,
	id: $page?.url?.href,
	image: `${data.products?.category?.img}`,
	logo: $page.data.store?.logo,
	ogSquareImage: { url: '', width: 56, height: 56 },
	openingHours: ['Monday,Tuesday,Wednesday,Thursday,Friday,Saturday 10:00-20:00'],
	timeToRead: 0,
	updatedAt: `${data.products?.category?.updatedAt || '_'}`,
	metaDescription: data.products?.category?.metaDescription,
	datePublished: `${data.products?.category?.publishedAt || '_'}`,
	description: ` ${data.products?.category?.description}`,
	dnsPrefetch: `//cdn.jsdelivr.net`,
	featuredImage: {
		url: `${data.products?.category?.img}`,
		width: 675,
		height: 380,
		caption: data.products?.category?.name
	},
	keywords: $page.data.store?.keywords,
	lastUpdated: `${data.products?.category?.updatedAt || '_'}`,
	msapplicationTileImage: `${data.products?.category?.img}`,
	ogImage: { url: $page.data.store?.logo, width: 128, height: 56 },
	ogImageSecureUrl: `${$page.data.store?.logo}`,
	ogImageType: 'image/jpeg',
	ogSiteName: `${$page.data.origin}/sitemap/sitemap.xml`,
	productAvailability: `${data.products?.category?.stock}`,
	productBrand: `${data.products?.category?.brandName || $page.data.store?.title}`,
	productName: `${data.products?.category?.name}`,
	productPriceCurrency: `${$page.data.store?.currencyCode}`,
	slug: `${data.products?.category?.slug}`,
	title: `${data.products?.category?.name || 'Buy online'}`,
	twitterImage: { url: `${data.products?.category?.img}` }
}

let currentPage = 1
let hidden = true
let priceRange = []
let reachedLast = false
let selectedFilter
let showFilter = false
let showOnPx = 600
let showSort = false
let y

if (
	data.products?.facets?.all_aggs?.price_stats?.max > 0 &&
	data.products?.facets?.all_aggs?.price_stats?.min >= 0
) {
	priceRange = generatePriceRange(
		data.products?.facets?.all_aggs?.price_stats,
		data.store?.currencySymbol
	)
}

$: innerWidth = 0

function goTop() {
	// scroll to the top
	window.scroll({ top: 0, behavior: 'smooth' })
}

function scrollContainer() {
	return document.documentElement || document.body
}

function handleOnScroll() {
	if (!scrollContainer()) {
		return
	}

	if (scrollContainer().scrollTop > showOnPx) {
		hidden = false
	} else {
		hidden = true
	}
}

async function sortNow(s) {
	let u = new URL($page.url)

	if (s == 'null' || s == null || s == undefined || s == 'undefined') {
		u.searchParams.delete('sort')
	} else {
		await u.searchParams.set('sort', s)
	}
	// await invalidateAll()
	goto(u.toString())
	window.scroll({ top: 0, behavior: 'smooth' })

	// await goto(`/search?${$page.url.searchParams.toString()}`)
}

async function loadNextPage() {
	if (!reachedLast) {
		let nextPage = currentPage + 1
		$page?.url?.searchParams.delete('page')
		const searchParams = $page?.url?.searchParams.toString()

		try {
			data.isLoading = true

			const res = await ProductService.fetchNextPageProducts({
				categorySlug: data.products?.category?.slug,
				nextPage,
				searchParams,
				origin: $page?.data?.origin,
				sid: $page?.data?.sid,
				storeId: $page.data.storeId
			})

			// console.log('res', res)

			const nextPageData = res?.nextPageData
			currentPage = currentPage + 1
			data.err = !res?.estimatedTotalHits ? 'No result Not Found' : null
			data.products.category = res?.category
			data.products.count = res?.count
			data.products.products = data?.products?.products?.concat(nextPageData)
			data.products.facets = res?.facets

			if (data.product?.count && data.products?.length === data.product?.count) {
				reachedLast = true
			}
		} catch (e) {
			toast(e, 'error')
		} finally {
			data.isLoading = false
		}
	}
}

async function refreshData() {}

let loadMoreDiv

$: store = $page.data.store
$: cart = {}
$: productsArray = []

onMount(() => {
	if (browser) {
		// storeStore.subscribe((value) => (store = value))

		// use productsArray at the place of product looping to display the currently activated cart and wishlist product
		cartStore.subscribe((value) => {
			if (value?.items?.length && Object.values(value)?.length) {
				cart = value
				const newArray = data.products.products.map((item2) => {
					const matchedItem = cart?.items?.find((item1) => item1.pid == item2._id)
					const cart_qty = matchedItem ? matchedItem.qty : 0
					return { ...item2, cart_qty }
				})
				productsArray = newArray
			} else productsArray = data.products.products
		})

		wishlistStore.subscribe((wishlists) => {
			if (wishlists?.length) {
				// console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzz', wishlists)
				const newArray = productsArray.map((p) => {
					const matchedItem = wishlists.find((w) => w.product._id == p._id)
					const isWishlisted = !!matchedItem
					return { ...p, isWishlisted }
				})
				productsArray = newArray
			} else productsArray = productsArray
		})

		// console.log('productsArray', productsArray)
	}

	const observer = new IntersectionObserver((entries) => {
		if (!entries) return

		entries.forEach((entry) => {
			if (
				entry.isIntersecting &&
				data.products?.count &&
				data.products?.products?.length < data.products?.count &&
				!data.isLoading
			) {
				// Do something when the element is intersecting
				loadNextPage()
			}
		})
	})

	if (loadMoreDiv && !$page?.data?.isDesktop) {
		observer.observe(loadMoreDiv)
	}

	// const intersectionObserver = new IntersectionObserver((entries) => {
	// 	if (entries[0].intersectionRatio <= 0) return
	// 	// load more content;
	// 	loadNextPage()
	// })

	// // start observing

	// intersectionObserver.observe(document.querySelector('.more'))
	// // @ts-ignore
	// gtag('event', 'view_item', {
	// 	currency: 'USD',
	// 	value: 7.77,
	// 	items: [
	// 		{
	// 			item_id: 'SKU_12345',
	// 			item_name: 'Stan and Friends Tee',
	// 			affiliation: 'Google Merchandise Store',
	// 			coupon: 'SUMMER_FUN',
	// 			currency: 'USD',
	// 			discount: 2.22,
	// 			index: 0,
	// 			item_brand: 'Google',
	// 			item_category: 'Apparel',
	// 			item_category2: 'Adult',
	// 			item_category3: 'Shirts',
	// 			item_category4: 'Crew',
	// 			item_category5: 'Short sleeve',
	// 			item_list_id: 'related_products',
	// 			item_list_name: 'Related Products',
	// 			item_variant: 'green',
	// 			location_id: 'ChIJIQBpAG2ahYAR_6128GcTUEo',
	// 			price: 9.99,
	// 			quantity: 1
	// 		}
	// 	]
	// })

	// // @ts-ignore
	// gtag('event', 'view_item_list', {
	// 	item_list_id: 'related_products',
	// 	item_list_name: 'Related products',
	// 	items: [
	// 		{
	// 			item_id: 'SKU_12345',
	// 			item_name: 'Stan and Friends Tee',
	// 			affiliation: 'Google Merchandise Store',
	// 			coupon: 'SUMMER_FUN',
	// 			currency: 'USD',
	// 			discount: 2.22,
	// 			index: 0,
	// 			item_brand: 'Google',
	// 			item_category: 'Apparel',
	// 			item_category2: 'Adult',
	// 			item_category3: 'Shirts',
	// 			item_category4: 'Crew',
	// 			item_category5: 'Short sleeve',
	// 			item_list_id: 'related_products',
	// 			item_list_name: 'Related Products',
	// 			item_variant: 'green',
	// 			location_id: 'ChIJIQBpAG2ahYAR_6128GcTUEo',
	// 			price: 9.99,
	// 			quantity: 1
	// 		}
	// 	]
	// })
	// }
})

async function goCheckbox(item) {
	if (item === $page.url.searchParams.get('tags')) {
		$page.url.searchParams.set('tags', '')
	} else {
		$page.url.searchParams.set('tags', item)
		$page.url.searchParams.set('page', '1')
	}
	await goto($page.url.toString())
	await invalidateAll()
}

function handleFilterTags() {
	selectedFilter = 'Tags'
	showFilter = true
}
</script>

<SEO {...seoProps} />

<svelte:window bind:scrollY="{y}" bind:innerWidth on:scroll="{handleOnScroll}" />

<CatelogNav me="{$page?.data?.me}" cart="{$page?.data?.cart}" store="{$page.data.store}">
	<div class="flex max-w-max flex-col items-start gap-1">
		{#if data.products?.category?.name}
			<h5 class="w-40 shrink-0 truncate capitalize leading-4 text-left">
				{data.products?.category?.name}
			</h5>
		{/if}

		<p>
			{#if data.products?.count}
				{data.products?.count}

				Items
			{:else}
				No Item
			{/if}
		</p>
	</div>
</CatelogNav>

<div class="h-full min-h-screen">
	<!-- Mobile black product count indicator -->

	{#if !hidden && innerWidth <= 1024 && data.products?.products?.length}
		<button
			transition:fade="{{ duration: 500 }}"
			aria-label="Click to go to top"
			class="fixed top-28 left-[50%] z-40 transform -translate-x-1/2 flex w-28 items-center justify-center gap-1 rounded-full bg-black bg-opacity-60 py-1 px-3 text-xs uppercase text-white transition duration-300 focus:outline-none hover:bg-opacity-80 active:scale-90 sm:top-36 whitespace-nowrap"
			on:click="{goTop}">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2"
				stroke="currentColor"
				class="h-3 w-3">
				<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
				></path>
			</svg>

			<span class="flex-1">{data.products?.products?.length} / {data.products?.count}</span>
		</button>
	{/if}

	<div class="mb-10 flex flex-col items-start sm:mb-20 lg:flex-row lg:gap-10 lg:p-10">
		{#if data.products.facets}
			<DesktopFilter
				class="sticky hidden lg:block {store?.hellobar?.active?.val ? 'top-32' : 'top-24'}"
				facets="{data.products.facets}"
				{priceRange}
				query="{data.query}"
				on:clearAll="{refreshData}" />

			<MobileFilter
				bind:showFilter
				bind:showSort
				class="fixed bottom-0 border-t z-40 block lg:hidden"
				facets="{data.products.facets}"
				{priceRange}
				selected="{selectedFilter}"
				on:clearAll="{refreshData}" />
		{/if}

		<div class="w-full flex-1 sm:px-10 sm:pt-10 lg:pt-0 lg:px-0">
			{#if data.products?.products?.length}
				<div class="flex flex-col gap-5">
					<div class="hidden flex-wrap items-center justify-between gap-4 px-3 sm:px-0 lg:flex">
						<!-- Name and count -->

						<div class="flex flex-wrap items-baseline gap-2">
							{#if data.products?.category?.name}
								<h1 class="capitalize">{data.products?.category?.name}</h1>
							{/if}

							<p>
								{#if data.products.count}
									- {data.products.count}
								{:else}
									No
								{/if}

								{#if data.products.count}
									items
								{:else}
									item
								{/if}
							</p>
						</div>

						<!-- Sort -->

						<div class="flex flex-wrap items-center justify-between">
							<label class="flex items-center gap-2">
								<span>Sort : </span>

								<select
									bind:value="{data.sort}"
									class="max-w-max border-b bg-transparent pr-2 font-semibold focus:border-primary-500 focus:outline-none hover:border-primary-500"
									on:change="{() => sortNow(data.sort)}">
									{#each sorts as s}
										<option value="{s.val}">{s.name}</option>
									{/each}
								</select>
							</label>
						</div>
					</div>

					<!-- Category top description -->

					{#if data.products?.category?.topDescription && data.products?.category?.topDescription?.length > 11}
						<div class="p-3 sm:p-0 prose max-w-none">
							{@html data.products?.category?.topDescription}
						</div>
					{/if}
				</div>

				<!-- Products -->

				<ul
					class="lg:mt-5 grid grid-cols-2 items-start border-t sm:flex sm:flex-wrap sm:justify-between sm:gap-3 sm:border-t-0 lg:gap-6">
					{#each data.products?.products as p, px (p._id)}
						<li in:fly="{{ y: 20, duration: 300, delay: 100 * px }}">
							<ProductCard product="{p}" />
						</li>

						<!-- Filter by tags -->

						{#if px % 40 === 39 && data.products?.facets?.all_aggs?.tags?.all?.buckets?.length}
							<div class="col-span-2 block sm:hidden overflow-x-auto bg-primary-100 scrollbar-none">
								<div class="w-full flex items-center gap-6 p-4">
									<div class="shrink-0">
										<p>Filter by</p>

										<h2>Tags</h2>
									</div>

									<ul class="flex max-w-[40rem] shrink-0 flex-wrap gap-2">
										{#each data.products.facets.all_aggs.tags.all.buckets || [] as t, tx}
											{#if t && tx < 12}
												<button
													type="button"
													class="capitalizefocus:outline-none max-w-max rounded bg-white py-2 px-4 text-sm"
													on:click="{() => goCheckbox(t.key)}">
													{t.key}
												</button>
											{/if}
										{/each}

										{#if data.products.facets.all_aggs.tags.all.buckets?.length - 12 > 0}
											<button
												type="button"
												class="text-sm text-primary-500 focus:outline-none"
												on:click="{handleFilterTags}">
												+{data.products.facets.all_aggs.tags.all.buckets?.length - 12} more
											</button>
										{/if}
									</ul>
								</div>
							</div>
						{/if}
					{/each}

					{#each { length: 7 } as _}
						<li class="hidden sm:block">
							<DummyProductCard />
						</li>
					{/each}
				</ul>

				{#if !$page?.data?.isDesktop}
					<!-- <div class="more"> -->
					<div bind:this="{loadMoreDiv}">
						<!-- Dot loading gif -->
						{#if data.isLoading}
							<div class="flex items-center justify-center p-6">
								<img
									src="{dotsLoading}"
									alt="loading"
									class="h-auto w-5 object-contain object-center" />
							</div>
						{/if}
					</div>

					<!-- Reached last -->

					{#if reachedLast}
						<p class="p-4 text-center">
							<i>~ You have seen all the products ~</i>
						</p>
					{/if}
				{:else}
					<Pagination
						count="{Math.ceil((data.products?.count || 1) / data.products?.pageSize)}"
						current="{data?.currentPage || 1}"
						providePaddingOnMobile />
				{/if}
			{:else}
				<div class="flex items-center justify-center px-3 sm:px-0" style="height: 60vh;">
					<div class="m-10 flex flex-col items-center justify-center text-center">
						<h2 class="mb-10 capitalize">
							{#if data.searchData}You searched for "{data.searchData}"{/if}
						</h2>

						<div class="mb-5">
							<img
								src="{noDataAvailable}"
								alt="no data available"
								class="h-60 w-auto object-contain text-xs" />
						</div>

						<h2 class="mb-1">We couldn't find any matches!</h2>

						<p class="mb-5">Please check the spelling or try searching something else</p>

						<PrimaryButton class="text-sm" on:click="{() => goto('/')}">Back to Home</PrimaryButton>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- CATEGORY DESCRIPTION -->

	{#if data.products?.category?.description && data.products?.category?.description?.length > 11}
		<div class="justify-center bg-zinc-50 px-3 py-10 sm:px-10 sm:py-20">
			<div
				class="container mx-auto grid max-w-6xl grid-cols-1 gap-10 text-sm sm:gap-20 md:grid-cols-6">
				<div
					class="prose col-span-1 max-w-none text-justify
					{data?.products?.products.length ? 'md:col-span-3 lg:col-span-4' : 'md:col-span-6'}">
					{@html data.products?.category?.description}
				</div>

				{#if data?.products?.products.length}
					<!-- <div class="col-span-1 md:col-span-3 lg:col-span-2">
						<h3 class="my-5 text-center uppercase">
							{data.products?.category?.name} price list
						</h3>

						<h5 class="mb-2 grid grid-cols-6 items-start gap-5 uppercase">
							<span class="col-span-5">{data.products?.category?.name}</span>

							<span class="col-span-1">Price <br /> (Rs)</span>
						</h5>

						<ul class="flex flex-col gap-2">
							{#each data.products?.products as p, px}
								{#if p && px < 10}
									<li>
										<a
											href="/product/{p.slug}"
											aria-label="Click to visit product details page"
											class="grid grid-cols-6 gap-5">
											<p class="col-span-5 text-justify">{p.name}</p>

											<span class="col-span-1 whitespace-nowrap">
												{currency(p.price, data?.store?.currencySymbol)}
											</span>
										</a>
									</li>
								{/if}
							{/each}

							{#if data?.products?.products && data?.products?.products[0] && data?.products?.products[0]?.updatedAt}
								<li>
									<p>
										<i>
											Data last updated on {dateOnly(data.products?.products[0]?.updatedAt)}
										</i>
									</p>
								</li>
							{/if}
						</ul>
					</div> -->
				{/if}
			</div>
		</div>
	{/if}
</div>
