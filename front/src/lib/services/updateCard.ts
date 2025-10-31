import type { Card } from '@domain/card';
import { apiFetch } from './api';

export async function updateCard(boardId: string, card: Card): Promise<void> {
	const response = await apiFetch(`/api/boards/${boardId}/cards/${card.id}`, {
		method: 'PUT',
		body: JSON.stringify(card)
	});
	if (response.ok) {
		return;
	} else {
		throw new Error('Failed to update card');
	}
}
