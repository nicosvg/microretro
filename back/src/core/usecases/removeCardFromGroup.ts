import type { BoardId } from "@domain/board";
import type { CardId } from "@domain/card";
import type { CardRepository } from "../ports/CardRepository";
import type { GroupRepository } from "../ports/GroupRepository";
import type { GroupId } from "@domain/group";
import type { PubSubGateway } from "../ports/PubSubGateway";
import { Events } from "@domain/event";

export function removeCardFromGroup(
  cardRepo: CardRepository,
  groupRepo: GroupRepository,
  pubSub: PubSubGateway,
) {
  return async function (
    boardId: BoardId,
    cardId: CardId,
    groupId: GroupId
  ): Promise<void> {
    // Remove card's group association
    await cardRepo.updateCardGroup(cardId, null);

    // Get updated card to publish
    const updatedCard = await cardRepo.getCard(cardId);

    // Publish UPDATED_CARD event
    pubSub.publish(boardId, {
      event: Events.UPDATED_CARD,
      payload: { card: updatedCard },
    });

    // Update group's cardIds list
    const group = await groupRepo.getGroup(groupId);
    const updatedGroup = {
      ...group,
      cardIds: group.cardIds.filter((id) => id !== cardId),
    };

    // If group is now empty, delete it
    if (updatedGroup.cardIds.length === 0) {
      await groupRepo.deleteGroup(groupId);

      // Publish DELETED_GROUP event
      pubSub.publish(boardId, {
        event: Events.DELETED_GROUP,
        payload: { groupId },
      });
    } else {
      await groupRepo.updateGroup(updatedGroup);
    }
  };
}
