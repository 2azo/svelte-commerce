<script lang="ts">
// import logo from '$lib/assets/logo.png'
// import ProductTab from '$lib/components/Product/ProductTab.svelte'
import { Home } from '$lib/theme-config'
import { onMount } from 'svelte'
import { page } from '$app/stores'
import Cookie from 'cookie-universal'
import dayjs from 'dayjs'
import SEO from '$lib/components/SEO/index.svelte'
import { CollectionService, DealsService, ProductService } from '$lib/services'

const cookies = Cookie()
let today = dayjs(new Date()).toISOString()

export let data: any = {}
// console.log('data in routes/app/+page.svelte -> ', data)

let seoProps = {
	// addressCountry: 'India',
	// addressLocality: 'Semiliguda, Koraput',
	// addressRegion: 'Odisha',
	// alternateJsonHref: '',
	// alternateXml: { title: '', href: '' },
	brand: $page.data.store?.title,
	// breadcrumbs: '',
	caption: $page.data.store?.title,
	category: $page.data.store?.title,
	contentUrl: $page.data.store?.logo,
	createdAt: today,
	// depth: { unitCode: '', value: '' },
	email: `${$page.data.store?.email}`,
	// entityMeta: '',
	// facebookPage: '',
	// gtin: '',
	// height: '',
	id: $page?.url?.href,
	image: $page.data.store?.logo,
	logo: $page.data.store?.logo,
	ogSquareImage: { url: '', width: 56, height: 56 },
	openingHours: ['Monday,Tuesday,Wednesday,Thursday,Friday,Saturday 08:00-13:00'],
	// popularity: product.popularity,
	// postalCode: '764036',
	// price: product.price,
	// priceRange: `${product.price}-${product.mrp}`,
	// ratingCount: 1,
	// ratingValue: +product.ratings + 1,
	// sku: product.sku,
	// streetAddress: 'Padmajyoti Marg, Nandapur Road',
	timeToRead: 0,
	updatedAt: today,
	// weight: { unitCode: '', value: '' },
	// width: { unitCode: '', value: '' },
	// wlwmanifestXmlHref: '',
	metaDescription: $page.data.store?.metaDescription,
	// article: false,
	datePublished: today,
	description: $page.data.store?.description,
	dnsPrefetch: `//cdn.jsdelivr.net`,
	// entityMeta: null,
	featuredImage: {
		url: $page.data.store?.logo,
		width: 675,
		height: 380,
		caption: $page.data.store?.title
	},
	keywords: $page.data.store?.keywords,
	lastUpdated: today,
	msapplicationTileImage: $page.data.store?.logo,
	ogImage: { url: $page.data.store?.logo, width: 128, height: 56 },
	ogImageSecureUrl: `${$page.data.store?.logo}`,
	ogImageType: 'image/jpeg',
	ogSiteName: `${$page.data.origin}/sitemap/sitemap.xml`,
	// productAvailability: `${product.stock}`,
	productBrand: $page.data.store?.title,
	productName: $page.data.store?.title,
	// productPriceAmount: `${product.price}`,
	productPriceCurrency: `${$page.data.store?.currencyCode}`,
	slug: `/`,
	// timeToRead: 0,
	title: $page.data.store?.title,
	twitterImage: { url: $page.data.store?.logo }
}

let showFooter = false
let showPinCodeEntryModal = false

onMount(async () => {
	const pin = cookies.get('zip')
	if (pin && pin.toString()?.length === 6) {
		showPinCodeEntryModal = false
	} else {
		showPinCodeEntryModal = true
	}
	try {
		if ($page.data.store?.isDeals && !$page.data.store?.isCollections) {
			const [deals, products] = await Promise.all([
				DealsService.fetchDeals({
					origin,
					storeId: $page.data.storeId
				}),
				ProductService.fetchProducts({
					query: data.query,
					origin,
					storeId: $page.data.storeId
				})
			])
			data.deals = deals
			data.products = products
		} else if (!$page.data.store?.isDeals && $page.data.store?.isCollections) {
			const [collections, products] = await Promise.all([
				CollectionService.fetchCollections({
					origin,
					storeId: $page.data.storeId
				}),
				ProductService.fetchProducts({
					query: data.query,
					origin,
					storeId: $page.data.storeId
				})
			])
			data.collections = collections
			data.products = products
		} else if ($page.data.store?.isDeals && $page.data.store?.isCollections) {
			const [deals, collections, products] = await Promise.all([
				DealsService.fetchDeals({
					origin,
					storeId: $page.data.storeId
				}),
				CollectionService.fetchCollections({
					origin,
					storeId: $page.data.storeId
				}),
				ProductService.fetchProducts({
					query: data.query,
					origin,
					storeId: $page.data.storeId
				})
			])
			data.deals = deals
			data.collections = collections
			data.products = products
		} else {
			const [products] = await Promise.all([
				ProductService.fetchProducts({
					query: data.query,
					origin,
					storeId: $page.data.storeId
				})
			])
			data.products = products
		}
	} catch (e) {
		console.log('e', e)
	}
})
</script>

<SEO {...seoProps} />

<Home {data} {showFooter} {showPinCodeEntryModal} />
