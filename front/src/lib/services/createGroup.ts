import type { BoardId } from '@domain/board';
import { apiFetch } from './api';
import type { CardId } from '@domain/card';

export async function createGroup(
	boardId: BoardId,
	sourceCardId: CardId,
	destinationCardId: CardId
): Promise<string> {
	const response = await apiFetch(`/api/boards/${boardId}/groups`, {
		method: 'POST',
		body: JSON.stringify({ sourceCardId, destinationCardId })
	});
	if (response.ok) {
		const data = await response.json();
		return data.cardId;
	} else {
		throw new Error('Failed to create group');
	}
}
