import { browser } from '$app/environment';
import { writable } from "svelte/store";
import type { BoardId } from './domain/board';

// Create a new store with the given data.
export const state = writable<MessageData>();

export const Events = {
  CREATED_CARD: 'CREATED_CARD',
  JOINED_BOARD: 'JOINED_BOARD',
  CONNECTED: 'CONNECTED',
} as const;

export type MessageData = {
  event: (typeof Events)[keyof typeof Events];
  payload: unknown;
};

function openWebsocket(boardId: BoardId) {
  if (browser) {
    const ws = new WebSocket(`ws://localhost:3001/ws/${boardId}`);

    ws.onopen = (event) => {
      console.log('WebSocket client opened', event);
      //TODO: send auth token
      ws.send(JSON.stringify({ event: 'CONNECTED', payload: { user: { id: 'foo' } } }));
    };
    ws.onmessage = (messageEvent) => {
      const data: MessageData = JSON.parse(messageEvent.data.toString());
      console.log('WebSocket client received', data);
      state.set(data);
    };
    ws.onclose = (event) => {
      console.log('WebSocket client closed', event);
    };

    // const sendMessage = (message: MessageData) => {
    //   if (ws.readyState <= 1) {
    //     ws.send(JSON.stringify(message));
    //   }
    // }
  }
}

export default {
  subscribe: state.subscribe,
  openWebsocket,
  // sendMessage: sendMessage || null
}
