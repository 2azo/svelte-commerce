<style>
.minimum-width-rem {
	min-width: 360px;
}
</style>

<script lang="ts">
// import { pwaInfo } from 'virtual:pwa-info'
import './../app.css'
import { BackToTop, LazyImg } from '$lib/components' // Can not dynamically import Google Analytics, it throws gtag not found error, not even party town
import { beforeNavigate } from '$app/navigation'
import { navigating } from '$app/stores'
import { updated } from '$app/stores'
import PreloadingIndicator from '$lib/PreloadingIndicator.svelte'
import { Toaster } from 'svelte-sonner'

export let data
console.log('data start');
console.log('data', data);

$: innerWidth = 0
// $: isAndroid = false

let customfont = data.store?.fontFamily || ''
let showBackToTopButton = true

$: if (innerWidth < 1024) {
	showBackToTopButton = false
} else {
	showBackToTopButton = true
}
// let ReloadPrompt
$: store = data.store

beforeNavigate(({ willUnload, to }) => {
	if ($updated && !willUnload && to?.url) {
		location.href = to.url.href
	}
})

</script>

<svelte:head>
	<link rel="icon" type="image/x-icon" href="{data.store?.favicon}" />
	<link rel="shortcut icon" type="image/x-icon" href="{data.store?.favicon}" />
	<meta name="theme-color" content="{data.store?.themeColor}" />
	<link rel="apple-touch-icon" href="{data.store?.favicon}" />
	<meta name="apple-mobile-web-app-title" content="{data.store?.websiteName}" />
	<meta name="application-name" content="{data.store?.websiteName}" />
	<link
		href="https://fonts.googleapis.com/css2?family={data.store?.fontFamily ||
			'Karla'}:wght@100;200;300;400;500;600;700;800;900&display=swap"
		rel="stylesheet" />
</svelte:head>

<svelte:window bind:innerWidth />
<main style="font-family: {customfont};">

	{#if $navigating}
		<PreloadingIndicator />
	{/if}

	{#if !data?.store}
		<!-- If store not found -->
		<h1>store not found</h1>
	{:else if data?.store && !data?.store?.closed}
		<!-- If store found and is not closed -->
		<!-- <h1>store found and is not closed</h1> -->
		<section class="minimum-width-rem relative flex min-h-screen flex-col bg-white antialiased">
			<div class="h-rem w-full flex-1">
				{#key data.url}
					
					<slot />
					<h1> inside the for loop</h1>
				{/key}
			</div>
		</section>

		<!-- <PartytownSnippet /> -->

		{#if showBackToTopButton}
			<BackToTop />
		{/if}

	{:else}
		<!-- If store found and is closed -->
		<h1> store found a	nd is closed </h1>
	{/if}
</main>

<Toaster />
