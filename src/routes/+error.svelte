<script>
import { Nav } from '$lib/theme-config'
import { page } from '$app/stores'
import { PrimaryButton } from '$lib/ui'
import errAnimated from '$lib/assets/no/error.svg'
import errBackground from '$lib/assets/no/error-background.png'
import menu from '$lib/config/menu'
import { goto } from '$app/navigation'
import { browser } from '$app/environment'

export let data

let q = ''
let showSidebar = false

// console.log($page.status)
// Redirect to homepage in case of error, 404, 500. Good for SEO. e.g. URL = https://natox.litekart.in/auth/forgot-password/4985097192661
if (($page.status == 404 || $page.status == 500) && browser) {
	goto('/')
}
</script>

<main class="h-screen w-full bg-zinc-100">
	<header class="mb-16 md:mb-0">
		<Nav
			me="{$page.data.me}"
			path="{$page?.url.pathname}"
			{menu}
			{q}
			showSidenavToggler
			store="{$page.data.store}"
			bind:showSidebar />
	</header>

	<section
		class="relative flex h-full w-full items-center justify-center bg-cover bg-no-repeat p-5 sm:p-16"
		style="background-image: url({errBackground});">
		<div class="container relative mx-auto max-w-3xl p-8 text-center sm:p-16">
			<div class="relative z-10 flex flex-col items-center justify-center">
				<img src="{errAnimated}" alt="" class="mb-5 max-h-60 w-auto object-contain object-bottom" />

				<div class="mb-2 text-xl font-bold sm:text-2xl">Something went wrong!</div>

				<p class="mb-10 text-sm text-zinc-500 sm:text-base">
					{#if $page.status === 401}
						{$page.error?.message || 'Need to login again'}
					{:else if $page.status === 403}
						Sorry, access denied.
					{:else if $page.status === 404}
						{@html $page.error?.message || 'Sorry, page not found.'}
					{:else if $page.status === 500}
						{@html $page.error?.message}
					{:else}
						{@html $page.error?.message || 'Sorry, the server is down.'}
					{/if}
				</p>

				<a href="/" aria-label="Click here to go back home" class="block">
					<PrimaryButton type="button" class="group text-sm">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							class="h-5 w-5 transform transition duration-300 group-hover:-translate-x-1">
							<path
								fill-rule="evenodd"
								d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
								clip-rule="evenodd"></path>
						</svg>

						<span> Home </span>
					</PrimaryButton>
				</a>
			</div>

			<div class="absolute top-10 left-10 z-0 text-8xl font-black text-[#F5F7FC] sm:text-9xl">
				{$page.status}
			</div>
		</div>
	</section>
</main>
