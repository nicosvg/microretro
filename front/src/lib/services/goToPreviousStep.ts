import type { BoardId } from '@domain/board';
import { apiFetch } from './api';

export async function goToPreviousStep(boardId: BoardId): Promise<void> {
	const response = await apiFetch(`/boards/${boardId}/previousState`, {
		method: 'POST'
	});
	if (response.ok) {
		console.log('board state updated');
	} else {
		throw new Error('Failed to update board state');
	}
}
