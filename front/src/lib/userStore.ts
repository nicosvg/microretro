import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const userId = writable<string | null>(null);
const showLoginPopup = writable(false);

function getUserFromLocalStorage() {
	if (!browser) return;
	const storedUserId = localStorage.getItem('userId');
	if (storedUserId) {
		console.log('Found stored user', storedUserId);
		userId.set(storedUserId);
		showLoginPopup.set(false);
	} else {
		console.log('No user found in local storage. Setting showLoginPopup');
		showLoginPopup.set(true);
	}
}

export { userId, showLoginPopup, getUserFromLocalStorage };
