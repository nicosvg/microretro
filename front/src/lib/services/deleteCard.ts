import { apiFetch } from './api';

export async function deleteCard(boardId: string, cardId: string): Promise<void> {
	const response = await apiFetch(`/boards/${boardId}/cards/${cardId}`, {
		method: 'DELETE'
	});

	if (!response.ok) {
		throw new Error('Failed to delete card');
	}
}
