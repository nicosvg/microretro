<script lang="ts">
	import { onMount } from 'svelte';
	import Login from '$lib/components/Login.svelte';
	import '../app.css';

	import { AppBar, Toast } from '@skeletonlabs/skeleton-svelte';
	import { toaster } from '$lib/toaster';
	import { userName, showLoginPopup, loadUserName } from '$lib/userStore';
	import { LogOut } from 'lucide-svelte';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	onMount(() => {
		loadUserName();
	});
</script>

<div class="app">
	<AppBar>
		<AppBar.Toolbar class="grid-cols-[1fr_auto]">
			<AppBar.Headline>
				<a href="/">MicroRetro</a>
			</AppBar.Headline>
			<AppBar.Trail>
				{#if $userName}
					<span class="user-badge">{$userName}</span>
					<button
						class="btn-icon btn-sm"
						title="Logout"
						onclick={() => {
							localStorage.removeItem('token');
							localStorage.removeItem('userId');
							userName.set(null);
							toaster.info({ title: 'Logged out' });
						}}
					>
						<LogOut size={18} />
					</button>
				{:else}
					<button
						class="btn btn-sm preset-filled-primary-500"
						onclick={() => showLoginPopup.set(true)}
					>
						Log in
					</button>
				{/if}
			</AppBar.Trail>
		</AppBar.Toolbar>
	</AppBar>
	<Toast.Group {toaster}>
		{#snippet children(toast)}
			<Toast {toast}>
				<Toast.Message>
					<Toast.Title>{toast.title}</Toast.Title>
					<Toast.Description>{toast.description}</Toast.Description>
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
	:global(.user-badge) {
		font-size: 0.875rem;
		color: #94a3b8;
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	:global(.user-badge::before) {
		content: '';
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: rgb(var(--color-primary-500));
		flex-shrink: 0;
	}

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
