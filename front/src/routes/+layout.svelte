<script lang="ts">
	import Login from '$lib/components/Login.svelte';
	import '../app.css';
	import '../app.css';

	import { AppBar, ToastProvider } from '@skeletonlabs/skeleton-svelte';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
	initializeStores();
</script>

<div class="app">
	<AppBar>
		{#snippet lead()}
			<a href="/">MicroRetro</a>
		{/snippet}
		{#snippet trail()}
			<a href="/changelog">Changelog</a>
			<a href="/roadmap">Roadmap</a>
			<a
				href="/"
				onclick={() => {
					localStorage.removeItem('token');
					localStorage.removeItem('userId');
					getToastStore().trigger({ message: 'Logged out' });
				}}
			>
				Logout
			</a>
		{/snippet}
	</AppBar>
	<Modal />
	<ToastProvider />
	<main class="">
		<Login></Login>

		{@render children?.()}
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>
