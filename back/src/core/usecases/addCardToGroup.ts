import type { CardId } from "@domain/card";
import type { CardRepository } from "../ports/CardRepository";
import type { GroupId } from "@domain/group";

export function addCardToGroup(cardRepo: CardRepository) {
  return async function (cardId: CardId, groupId: GroupId): Promise<void> {
    // Update card's group association
    await cardRepo.updateCardGroup(cardId, groupId);
  };
}
