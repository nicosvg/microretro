import type { CardId } from '@domain/card';
import { apiFetch } from './api';

export async function vote(cardId: CardId, value: number): Promise<boolean> {
	const response = await apiFetch(`/cards/${cardId}/vote`, {
		method: 'POST',
		body: JSON.stringify({ value })
	});
	if (response.ok) {
		console.debug('voted for card', cardId);
		return true;
	} else {
		console.error('Failed to vote for card', cardId, response.status);
		return false;
	}
}
