import { PUBLIC_WS_URL } from '$env/static/public';
import type { BoardId } from '@domain/board';
import type { MessageData } from '@domain/event';
import { websocketStatus } from './websocketStore';

let ws: WebSocket | null = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let isIntentionalClose = false;


export function openWebsocket(boardId: BoardId, messageCallback: (message: MessageData) => void) {
	const token = localStorage.getItem('token');
	if (ws !== null) {
		closeWebsocket()
	}
	isIntentionalClose = false;
	ws = new WebSocket(`${PUBLIC_WS_URL}/ws/${boardId}?access_token=${token}`);
	window.ws = ws;

	ws.onopen = (event) => {
		console.log('WebSocket client opened', event);
		reconnectAttempts = 0;
		if (reconnectTimeout) {
			clearTimeout(reconnectTimeout);
			reconnectTimeout = null;
		}
		websocketStatus.set('connected');
	};
	ws.onmessage = (messageEvent) => {
		const data: MessageData = JSON.parse(messageEvent.data.toString());
		console.log('WebSocket client received', data);
		messageCallback(data);
	};
	ws.onclose = (event) => {
		console.log('WebSocket client closed', event);
		ws = null;
		if (!isIntentionalClose) {
			attemptReconnect(boardId, messageCallback);
		}
	};
	ws.onerror = (event) => {
		console.log('WebSocket client error', event);
		ws?.close(); // Will trigger onclose and reconnection
	};
}

function attemptReconnect(boardId: BoardId, messageCallback: (message: MessageData) => void) {
	if (reconnectAttempts < maxReconnectAttempts) {
		reconnectAttempts++;
		const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // exponential backoff, max 30s
		console.log(`Attempting to reconnect WebSocket in ${delay}ms (attempt ${reconnectAttempts})`);
		websocketStatus.set('reconnecting');
		reconnectTimeout = setTimeout(() => {
			openWebsocket(boardId, messageCallback);
		}, delay);
	} else {
		console.warn('Max WebSocket reconnect attempts reached.');
		websocketStatus.set('disconnected');
	}
}

export function closeWebsocket() {
	websocketStatus.set('disconnected');
	isIntentionalClose = true;
	if (ws) {
		console.log("Closing websocket", ws);
		ws.close();
		ws = null;
	}
	if (reconnectTimeout) {
		clearTimeout(reconnectTimeout);
		reconnectTimeout = null;
	}
	reconnectAttempts = 0;
}

export function getWebsocketState() {
	return ws ? ws.readyState : WebSocket.CLOSED;
}

