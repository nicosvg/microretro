import { writable } from 'svelte/store';
import { openWebsocket } from './services/websocket';
import type { BoardId } from '@domain/board';
import type { MessageData } from '@domain/event';

// Create a new store with the given data.
export const state = writable<MessageData>();

const openBoardWebsocket = (boardId: BoardId) =>
	openWebsocket(boardId, (message) => {
		state.set(message);
	});

const openSSE = (boardId: BoardId) => {
	const evtSource = new EventSource('http://localhost:3000/sse?boardId=' + boardId);
	evtSource.onmessage = function (event) {
		console.log(event);
		const dataobj = event.data;
		console.log('SSE:', JSON.parse(dataobj));
		state.set(dataobj);
	};
};

export default {
	subscribe: state.subscribe,
	openBoardWebsocket,
	openSSE
};
