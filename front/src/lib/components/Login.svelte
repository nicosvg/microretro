<script lang="ts">
	import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { browser } from '$app/environment';
	import { invalidateAll } from '$app/navigation';
	import { createUser } from '$lib/services/createUser';

	const modalStore = getModalStore();

	const toastStore = getToastStore();

	const modal: ModalSettings = {
		type: 'prompt',
		title: 'Enter Name',
		body: 'Provide your first name in the field below.',
		value: '',
		valueAttr: { type: 'text', minlength: 3, maxlength: 10, required: true },
		response: async (name: string) => {
			const id = await createUser(name);
			if (browser) localStorage.setItem('userId', id);
			toastStore.trigger({ message: 'User created' });
			await invalidateAll();
		}
	};

	if (browser) {
		const userId = localStorage.getItem('userId');
		if (!userId) {
			modalStore.trigger(modal);
		}
	}
	// Check https://www.reddit.com/r/sveltejs/comments/sjoxq9/comment/hvg77eo/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button
</script>
