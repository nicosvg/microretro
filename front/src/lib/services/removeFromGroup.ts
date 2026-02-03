import type { BoardId } from '@domain/board';
import type { CardId } from '@domain/card';
import type { GroupId } from '@domain/group';
import { apiFetch } from './api';

export async function removeFromGroup(
  boardId: BoardId,
  groupId: GroupId,
  cardId: CardId
): Promise<void> {
  console.log('removeFromGroup service called', { boardId, groupId, cardId });
  const url = `/api/boards/${boardId}/groups/${groupId}/cards/${cardId}`;
  console.log('DELETE request to:', url);

  const response = await apiFetch(url, {
    method: 'DELETE'
  });

  console.log('Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API error:', errorText);
    throw new Error(`Failed to remove card from group: ${errorText}`);
  }

  console.log('Card removed successfully');
}
