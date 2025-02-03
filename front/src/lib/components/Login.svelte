<script lang="ts">
	import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { browser } from '$app/environment';
	import { invalidateAll } from '$app/navigation';
	import { createUser } from '$lib/services/createUser';

	import { showLoginPopup } from '$lib/userStore';

	const modalStore = getModalStore();

	const toastStore = getToastStore();

	const modal: ModalSettings = {
		type: 'prompt',
		title: 'Enter Name',
		body: 'Provide your name in the field below.',
		value: 'test',
		valueAttr: { type: 'text', minlength: 1, maxlength: 16, required: true },
		response: async (name: string) => {
			const id = await createUser(name);
			if (browser) localStorage.setItem('userId', id);
			toastStore.trigger({ message: 'User created' });
			await invalidateAll();
		}
	};

	showLoginPopup.subscribe((shouldOpenModal) => {
		console.log('shouldOpenModal', shouldOpenModal);
		if (shouldOpenModal) modalStore.trigger(modal);
		else modalStore.close();
	});

	// Check https://www.reddit.com/r/sveltejs/comments/sjoxq9/comment/hvg77eo/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button
</script>
