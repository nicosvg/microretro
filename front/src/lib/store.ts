import { writable } from 'svelte/store';
import type { MessageData } from './domain/Events';
import { openWebsocket } from './services/websocket';
import type { BoardId } from './domain/board';

// Create a new store with the given data.
export const state = writable<MessageData>();

const openBoardWebsocket = (boardId: BoardId) =>
	openWebsocket(boardId, (message) => {
		state.set(message);
	});

export default {
	subscribe: state.subscribe,
	openBoardWebsocket
};
