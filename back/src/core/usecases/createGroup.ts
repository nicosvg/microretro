import type { CardId } from "@domain/card";
import type { GroupRepository } from "../ports/GroupRepository";
import type { CardRepository } from "../ports/CardRepository";
import { newGroup, type Group } from "@domain/group";
import { v4 as uuidv4 } from "uuid";
import type { BoardId } from "@domain/board";

export function createGroup(
  groupRepo: GroupRepository,
  cardRepo: CardRepository,
) {
  return async function (
    boardId: BoardId,
    sourceCardId: CardId,
    destinationCardId: CardId,
  ): Promise<Group> {
    const groupId = uuidv4();
    const destinationCard = await cardRepo.getCard(destinationCardId);

    // Existing group
    if (destinationCard.groupId !== null) {
      cardRepo.updateCardGroup(sourceCardId, destinationCard.groupId);
      const group = await groupRepo.getGroup(destinationCard.groupId);
      group.cardIds.push(sourceCardId);
      group.cardIds.push(destinationCardId);
      return group;
    }

    // New group
    const group: Group = newGroup(boardId, destinationCard.column, groupId);
    await groupRepo.createGroup(group);

    // Get current groups of both cards
    const sourceCard = await cardRepo.getCard(sourceCardId);

    // Update each card to be part of this group
    await cardRepo.updateCardGroup(sourceCardId, groupId);
    await cardRepo.updateCardGroup(destinationCardId, groupId);

    // Check and clean up old group if it becomes empty
    const sourceGroupId = sourceCard.groupId;
    if (sourceGroupId !== null) {
      const res = await cardRepo.getCards(sourceGroupId)
      if (res.length < 1) {
        await groupRepo.deleteGroup(sourceGroupId);
      }
    }

    group.cardIds.push(sourceCardId);
    group.cardIds.push(destinationCardId);
    return group;
  };
}
