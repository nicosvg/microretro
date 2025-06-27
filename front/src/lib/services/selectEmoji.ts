import type { CardId } from '@domain/card';
import { apiFetch } from './api';
import type { BoardId } from '@domain/board';

export async function selectEmoji(boardId: BoardId, cardId: CardId, emoji: string): Promise<boolean> {
    const response = await apiFetch(`/boards/${boardId}/cards/${cardId}/emoji`, {
        method: 'POST',
        body: JSON.stringify({ emoji })
    });
    if (response.ok) {
        console.debug('selected emoji for card', cardId, emoji);
        return true;
    } else {
        console.error('Failed to select emoji for card', cardId, response.status);
        return false;
    }
} 