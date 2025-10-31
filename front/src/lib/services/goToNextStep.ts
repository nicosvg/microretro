import type { BoardId } from '@domain/board';
import { apiFetch } from './api';

export async function goToNextStep(boardId: BoardId): Promise<void> {
	const response = await apiFetch(`/api/boards/${boardId}/nextState`, {
		method: 'POST'
	});
	if (response.ok) {
		console.log('board state updated');
	} else {
		throw new Error('Failed to update board state');
	}
}
