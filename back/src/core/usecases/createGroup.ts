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
    const group: Group = newGroup(boardId, destinationCard.column, groupId);
    await groupRepo.createGroup(group);

    // Update each card to be part of this group
    await cardRepo.updateCardGroup(sourceCardId, groupId);
    await cardRepo.updateCardGroup(destinationCardId, groupId);

    return group;
  };
}
