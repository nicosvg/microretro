<script>
	import Login from '$lib/components/Login.svelte';
	import '../app.css';
	import '../app.css';

	import { initializeStores, Modal, Toast } from '@skeletonlabs/skeleton';
	import { getToastStore } from '@skeletonlabs/skeleton';
	initializeStores();
</script>

<div class="app">
	<Modal />
	<Toast />
	<main>
		<Login></Login>
		<button
			type="button"
			class="variant-filled btn"
			on:click={() => {
				localStorage.removeItem('token');
				localStorage.removeItem('userId');
				getToastStore().trigger({ message: 'Logged out' });
			}}
		>
			Logout
		</button>
		<slot></slot>
	</main>

	<footer>
		<p>visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to learn SvelteKit</p>
	</footer>
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

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
