import { getBoard } from '$lib/services/getBoard';
import { getUserFromLocalStorage } from '$lib/userStore.js';

export const ssr = false;

export async function load({ params, parent }) {
	getUserFromLocalStorage();
	await parent();
	const board = await getBoard(params.id);
	console.log('board', board);
	return board;
}
