<script lang="ts">
	import Login from '$lib/components/Login.svelte';
	import '../app.css';
	import '../app.css';

	import { AppBar, Toast } from '@skeletonlabs/skeleton-svelte';
	import { toaster } from '$lib/toaster';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
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
					toaster.info({ title: 'Logged out' });
				}}
			>
				Logout
			</a>
		{/snippet}
	</AppBar>
	<Toast.Group {toaster}>
		{#snippet children(toast)}
			<Toast {toast}>
				<Toast.Message>
					<Toast.Title />
					<Toast.Description />
				</Toast.Message>
				<Toast.CloseTrigger />
			</Toast>
		{/snippet}
	</Toast.Group>
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
