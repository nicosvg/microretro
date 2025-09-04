<script lang="ts">
	import { browser } from '$app/environment';
	import { invalidateAll } from '$app/navigation';
	import { createUser } from '$lib/services/createUser';
	import { toaster } from '$lib/toaster';
	import { Modal } from '@skeletonlabs/skeleton-svelte';

	import { showLoginPopup } from '$lib/userStore';

	let openState = $state(false);
	let userName = $state('');

	async function handleSubmit() {
		if (!userName.trim()) return;

		const id = await createUser(userName);
		if (browser) localStorage.setItem('userId', id);
		toaster.success({ title: 'User created' });
		await invalidateAll();
		openState = false;
	}

	showLoginPopup.subscribe((shouldOpenModal) => {
		console.log('shouldOpenModal', shouldOpenModal);
		openState = shouldOpenModal;
	});

	function handleOpenChange(details: { open: boolean }) {
		openState = details.open;
		if (!openState) {
			showLoginPopup.set(false);
		}
	}

	// Check https://www.reddit.com/r/sveltejs/comments/sjoxq9/comment/hvg77eo/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button
</script>

<Modal
	open={openState}
	onOpenChange={handleOpenChange}
	contentBase="card bg-surface-200-800 p-4 space-y-4 max-w-[320px]"
>
	{#snippet content()}
		<article>
			<header class="mb-4">
				<h3 class="h3">Enter your name</h3>
			</header>
			<p class="mb-4 opacity-60">Write your name in the field below.</p>
			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleSubmit();
				}}
				class="space-y-4"
			>
				<input
					bind:value={userName}
					type="text"
					minlength="1"
					maxlength="16"
					required
					placeholder="Your name"
					class="input"
				/>
				<div class="flex justify-end gap-2">
					<button type="button" class="btn variant-ghost" onclick={() => (openState = false)}>
						Cancel
					</button>
					<button type="submit" class="btn variant-filled-primary"> Create User </button>
				</div>
			</form>
		</article>
	{/snippet}
</Modal>

<style>
	:global(.modal) {
		z-index: 99999 !important;
	}

	:global(.modal-backdrop) {
		z-index: 99998 !important;
	}
</style>
