import type { CardRepository } from "../ports/CardRepository";
import type { GroupRepository } from "../ports/GroupRepository";
import type { CardId, GroupId } from "@domain/group";

export function addCardToGroup(
  cardRepo: CardRepository,
  groupRepo: GroupRepository
) {
  return async function (cardId: CardId, groupId: GroupId): Promise<void> {
    // Update card's group association
    await cardRepo.updateCardGroup(cardId, groupId);
    
    // Update group's cardIds list
    const group = await groupRepo.getGroup(groupId);
    const updatedGroup = {
      ...group,
      cardIds: [...group.cardIds, cardId]
    };
    await groupRepo.updateGroup(updatedGroup);
  };
}
