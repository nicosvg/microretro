import type { CardRepository } from "../ports/CardRepository";
import type { GroupRepository } from "../ports/GroupRepository";
import type { CardId, GroupId } from "@domain/group";

export function removeCardFromGroup(
  cardRepo: CardRepository,
  groupRepo: GroupRepository
) {
  return async function (cardId: CardId, groupId: GroupId): Promise<void> {
    // Remove card's group association
    await cardRepo.updateCardGroup(cardId, null);
    
    // Update group's cardIds list
    const group = await groupRepo.getGroup(groupId);
    const updatedGroup = {
      ...group,
      cardIds: group.cardIds.filter(id => id !== cardId)
    };
    
    // If group is now empty, delete it
    if (updatedGroup.cardIds.length === 0) {
      await groupRepo.deleteGroup(groupId);
    } else {
      await groupRepo.updateGroup(updatedGroup);
    }
  };
}
