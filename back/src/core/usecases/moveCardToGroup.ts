import type { BoardId } from "@domain/board";
import type { Card, CardId } from "@domain/card";
import { newGroup, type Group } from "@domain/group";
import { v4 as uuidv4 } from "uuid";
import type { CardRepository } from "../ports/CardRepository";
import type { GroupRepository } from "../ports/GroupRepository";

/**
 * @returns Group if a group was created, null otherwise
 */
export function moveCardToGroup(

  groupRepo: GroupRepository,
  cardRepo: CardRepository,
) {
  return async function (
    boardId: BoardId,
    sourceCardId: CardId,
    destinationCardId: CardId,
  ): Promise<{ updatedSourceCard: Card, createdGroup: Group | null }> {
    const destinationCard = await cardRepo.getCard(destinationCardId);
    const sourceCard = await cardRepo.getCard(sourceCardId);

    let group: Group | null = null

    if (destinationCard.groupId !== null) {
      // Existing group
      await cardRepo.updateCardGroup(sourceCardId, destinationCard.groupId);
    } else {
      // New group
      const groupId = uuidv4();
      group = newGroup(boardId, destinationCard.column, groupId);
      await groupRepo.createGroup(group);

      await cardRepo.updateCardGroup(sourceCardId, groupId);
      await cardRepo.updateCardGroup(destinationCardId, groupId);

      group.cardIds.push(sourceCardId);
      group.cardIds.push(destinationCardId);
    }

    // Check and clean up old group if it becomes empty
    await cleanEmptyGroups(sourceCard, cardRepo, groupRepo);

    return {
      updatedSourceCard: {
        ...sourceCard,
        groupId: group?.id ?? destinationCard.groupId,
      },
      createdGroup: group,
    }
  };
}

async function cleanEmptyGroups(sourceCard: Card, cardRepo: CardRepository, groupRepo: GroupRepository) {
  const sourceGroupId = sourceCard.groupId;
  if (sourceGroupId !== null) {
    const res = await cardRepo.getCards(sourceGroupId);
    console.info('Cards remaining in source group:', res.length);
    if (res.length < 1) {
      console.info('Deleting empty group:', sourceGroupId);
      await groupRepo.deleteGroup(sourceGroupId);
    }
  }
}

