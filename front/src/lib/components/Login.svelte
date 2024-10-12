<script lang="ts">
	import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { createUser } from '../../services/createUser';

	const modalStore = getModalStore();

	const toastStore = getToastStore();

	const modal: ModalSettings = {
		type: 'prompt',
		title: 'Enter Name',
		body: 'Provide your first name in the field below.',
		value: '',
		valueAttr: { type: 'text', minlength: 3, maxlength: 10, required: true },
		response: async (r: string) => {
			const id = await createUser(r);
			localStorage.setItem('userId', id);
			toastStore.trigger({ message: 'User created' });
		}
	};

	// Read the user id and username from local storage
	const userId = localStorage.getItem('userId');
	// const username = localStorage.getItem('username');
	if (!userId) {
		modalStore.trigger(modal);
	}
</script>
