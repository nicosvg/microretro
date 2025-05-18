import type { BoardId } from "@domain/board";
import type { CardId } from "@domain/card";
import { newGroup, type Group } from "@domain/group";
import { v4 as uuidv4 } from "uuid";
import type { CardRepository } from "../ports/CardRepository";
import type { GroupRepository } from "../ports/GroupRepository";

export function createGroup(
  groupRepo: GroupRepository,
  cardRepo: CardRepository,
) {
  return async function (
    boardId: BoardId,
    sourceCardId: CardId,
    destinationCardId: CardId,
  ): Promise<Group> {
    const destinationCard = await cardRepo.getCard(destinationCardId);
    const sourceCard = await cardRepo.getCard(sourceCardId);

    // Check and clean up old group if it becomes empty
    const sourceGroupId = sourceCard.groupId;
    if (sourceGroupId !== null) {
      const res = await cardRepo.getCards(sourceGroupId)
      if (res.length < 1) {
        await groupRepo.deleteGroup(sourceGroupId);
      }
    }

    let group: Group

    if (destinationCard.groupId !== null) {
      // Existing group
      group = await groupRepo.getGroup(destinationCard.groupId);
    } else {
      // New group
      const groupId = uuidv4();
      group = newGroup(boardId, destinationCard.column, groupId);
      await groupRepo.createGroup(group);

      await cardRepo.updateCardGroup(destinationCardId, groupId);
    }

    cardRepo.updateCardGroup(sourceCardId, group.id);

    group.cardIds.push(sourceCardId);
    group.cardIds.push(destinationCardId);
    return group;
  };
}
