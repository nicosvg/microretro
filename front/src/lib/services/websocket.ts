import type { BoardId } from '$lib/domain/board';
import type { MessageData } from '$lib/domain/Events';

export function openWebsocket(boardId: BoardId, messageCallback: (message: MessageData) => void) {
	const token = localStorage.getItem('token');
	const ws = new WebSocket(`ws://localhost:3001/ws/${boardId}?access_token=${token}`);

	ws.onopen = (event) => {
		console.log('WebSocket client opened', event);
		ws.send(JSON.stringify({ event: 'CONNECTED', payload: { user: { id: 'foo' } } }));
	};
	ws.onmessage = (messageEvent) => {
		const data: MessageData = JSON.parse(messageEvent.data.toString());
		console.log('WebSocket client received', data);
		messageCallback(data);
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
