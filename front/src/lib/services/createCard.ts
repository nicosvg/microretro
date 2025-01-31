import { apiFetch } from './api';

export async function createCard(boardId: string, text: string, column: number): Promise<string> {
	const response = await apiFetch(`/boards/${boardId}/cards`, {
		method: 'POST',
		body: JSON.stringify({ text, column, boardId })
	});
	if (response.ok) {
		const data = await response.json();
		return data.cardId;
	} else {
		throw new Error('Failed to create card');
	}
}
