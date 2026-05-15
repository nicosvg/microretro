import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const userId = writable<string | null>(null);
const userName = writable<string | null>(null);
const showLoginPopup = writable(false);

function decodeTokenName(token: string): string | null {
	try {
		return JSON.parse(atob(token.split('.')[1])).name ?? null;
	} catch {
		return null;
	}
}

function getUserFromLocalStorage() {
	if (!browser) return;
	const storedUserId = localStorage.getItem('userId');
	if (storedUserId) {
		userId.set(storedUserId);
		const token = localStorage.getItem('token');
		if (token) userName.set(decodeTokenName(token));
		showLoginPopup.set(false);
	} else {
		showLoginPopup.set(true);
	}
}

function loadUserName() {
	if (!browser) return;
	const token = localStorage.getItem('token');
	if (token) userName.set(decodeTokenName(token));
}

export { userId, userName, showLoginPopup, getUserFromLocalStorage, loadUserName };
