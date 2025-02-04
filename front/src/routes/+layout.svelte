<script lang="ts">
	import Login from '$lib/components/Login.svelte';
	import '../app.css';
	import '../app.css';

	import { AppBar, initializeStores, Modal, Toast } from '@skeletonlabs/skeleton';
	import { getToastStore } from '@skeletonlabs/skeleton';
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
	<Toast />
	<main>
		<Login></Login>

		{@render children?.()}
	</main>

	<footer class="flex flex-row items-center justify-around py-4 backdrop-grayscale"></footer>
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
