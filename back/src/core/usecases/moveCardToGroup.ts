import type { BoardId } from "@domain/board";
import type { Card, CardId } from "@domain/card";
import { newGroup, type Group } from "@domain/group";
import { v4 as uuidv4 } from "uuid";
import type { CardRepository } from "../ports/CardRepository";
import type { GroupRepository } from "../ports/GroupRepository";
import type { PubSubGateway } from "../ports/PubSubGateway";
import { Events } from "@domain/event";

/**
 * @returns Group if a group was created, null otherwise
 */
export function moveCardToGroup(
  groupRepo: GroupRepository,
  cardRepo: CardRepository,
  pubSub: PubSubGateway,
) {
  return async function (
    boardId: BoardId,
    sourceCardId: CardId,
    destinationCardId: CardId,
  ): Promise<void> {
    const destinationCard = await cardRepo.getCard(destinationCardId);
    const sourceCard = await cardRepo.getCard(sourceCardId);

    let group: Group | null = null;
    let updatedSourceCard: Card;

    if (destinationCard.groupId !== null) {
      // Existing group
      await cardRepo.updateCardGroup(sourceCardId, destinationCard.groupId);
      updatedSourceCard = { ...sourceCard, groupId: destinationCard.groupId };
    } else {
      // New group
      const groupId = uuidv4();
      group = newGroup(boardId, destinationCard.column, groupId);
      await groupRepo.createGroup(group);

      await cardRepo.updateCardGroup(sourceCardId, groupId);
      await cardRepo.updateCardGroup(destinationCardId, groupId);

      group.cardIds.push(sourceCardId);
      group.cardIds.push(destinationCardId);
      updatedSourceCard = { ...sourceCard, groupId };

      if (group !== null) {
        pubSub.publish(boardId, {
          event: Events.CREATED_GROUP,
          payload: { group },
        });
      }
    }

    // Publish UPDATED_CARD for the source card
    pubSub.publish(boardId, {
      event: Events.UPDATED_CARD,
      payload: { card: updatedSourceCard },
    });


    // Check and clean up old group if it becomes empty
    await cleanEmptyGroups(sourceCard, cardRepo, groupRepo, pubSub, boardId);
  };
}

async function cleanEmptyGroups(
  sourceCard: Card,
  cardRepo: CardRepository,
  groupRepo: GroupRepository,
  pubSub: PubSubGateway,
  boardId: BoardId,
) {
  const sourceGroupId = sourceCard.groupId;
  if (sourceGroupId !== null) {
    const res = await cardRepo.getCards(sourceGroupId);
    if (res.length < 1) {
      await groupRepo.deleteGroup(sourceGroupId);
      // Publish DELETED_GROUP event
      pubSub.publish(boardId, {
        event: "DELETED_GROUP",
        payload: { groupId: sourceGroupId },
      });
    }
  }
}

