<script lang="ts">
	import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { createUser } from '../../services/createUser';
	import { browser } from '$app/environment';

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
		}
	};

	if (browser) {
		const userId = localStorage.getItem('userId');
		if (!userId) {
			modalStore.trigger(modal);
		}
	}
</script>
