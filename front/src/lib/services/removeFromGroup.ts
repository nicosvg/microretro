import type { BoardId } from '@domain/board';
import type { CardId } from '@domain/card';
import type { GroupId } from '@domain/group';
import { apiFetch } from './api';

export async function removeFromGroup(
  boardId: BoardId,
  groupId: GroupId,
  cardId: CardId
): Promise<void> {
  const response = await apiFetch(`/api/boards/${boardId}/groups/${groupId}/cards/${cardId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Failed to remove card from group');
  }
}
