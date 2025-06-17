import type { BoardId } from '@domain/board';
import { apiFetch } from './api';

export async function markUserReady(boardId: BoardId, isReady: boolean): Promise<void> {
    const response = await apiFetch(`/boards/${boardId}/ready`, {
        method: 'POST',
        body: JSON.stringify({ isReady })
    });
    if (response.ok) {
        console.log('user ready state updated');
    } else {
        throw new Error('Failed to update user ready state');
    }
} 