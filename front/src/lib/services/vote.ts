import type { CardId } from '@domain/card';
import { apiFetch } from './api';
import type { BoardId } from '@domain/board';

export async function vote(boardId: BoardId, cardId: CardId, newValue: number): Promise<boolean> {
	const response = await apiFetch(`/api/boards/${boardId}/cards/${cardId}/vote`, {
		method: 'POST',
		body: JSON.stringify({ value: newValue })
	});
	if (response.ok) {
		console.debug('voted for card', cardId);
		return true;
	} else {
		console.error('Failed to vote for card', cardId, response.status);
		return false;
	}
}
