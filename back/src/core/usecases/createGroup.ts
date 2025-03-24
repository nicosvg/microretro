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
    column: number,
    cardIds: CardId[],
  ): Promise<string> {
    const groupId = uuidv4();
    const group: Group = newGroup(boardId, column, groupId);
    await groupRepo.createGroup(group);

    // Update each card to be part of this group
    await Promise.all(
      cardIds.map((cardId) => cardRepo.updateCardGroup(cardId, groupId)),
    );

    return groupId;
  };
}
