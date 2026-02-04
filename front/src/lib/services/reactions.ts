import type { BoardId } from '@domain/board';
import type { CardId } from '@domain/card';
import type { ReactionDTO, Emoji } from '@domain/reaction';
import { apiFetch } from './api';

export async function addReaction(
  boardId: BoardId,
  cardId: CardId,
  emoji: Emoji
): Promise<ReactionDTO> {
  const response = await apiFetch(`/api/boards/${boardId}/cards/${cardId}/reactions`, {
    method: 'POST',
    body: JSON.stringify({ emoji })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to add reaction' }));
    throw new Error(error.error || 'Failed to add reaction');
  }

  const data = await response.json();
  return data.reaction;
}

export async function removeReaction(
  boardId: BoardId,
  cardId: CardId
): Promise<void> {
  const response = await apiFetch(`/api/boards/${boardId}/cards/${cardId}/reactions`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to remove reaction' }));
    throw new Error(error.error || 'Failed to remove reaction');
  }
}

export async function getReactions(boardId: BoardId): Promise<ReactionDTO[]> {
  const response = await apiFetch(`/api/boards/${boardId}/reactions`, {
    method: 'GET'
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to get reactions' }));
    throw new Error(error.error || 'Failed to get reactions');
  }

  const data = await response.json();
  return data.reactions;
}
