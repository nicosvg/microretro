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
		<slot></slot>
	</main>

	<footer class="flex flex-row items-center justify-around py-4 backdrop-grayscale">
		<button
			type="button"
			class="variant-soft btn"
			on:click={() => {
				localStorage.removeItem('token');
				localStorage.removeItem('userId');
				getToastStore().trigger({ message: 'Logged out' });
			}}
		>
			Logout
		</button>
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
</style>
