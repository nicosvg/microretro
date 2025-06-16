import { writable } from 'svelte/store';

export type WebsocketStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export const websocketStatus = writable<WebsocketStatus>('disconnected'); 