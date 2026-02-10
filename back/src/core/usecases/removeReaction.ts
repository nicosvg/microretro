import type { ReactionRepository } from "../ports/ReactionRepository";
import type { PubSubGateway } from "../ports/PubSubGateway";
import type { CardId } from "@domain/card";
import type { UserId } from "@domain/user";
import type { BoardId } from "@domain/board";
import type { Emoji } from "@domain/reaction";
import { Events } from "@domain/event";

export function removeReaction(
  reactionRepo: ReactionRepository,
  pubSub: PubSubGateway,
) {
  return async function (
    boardId: BoardId,
    cardId: CardId,
    emoji: Emoji,
    userId: UserId
  ): Promise<void> {
    // Remove the user's reaction from the card
    await reactionRepo.removeReaction(cardId, emoji, userId);

    // Get all remaining reactions for this card
    const allReactions = await reactionRepo.getReactionsByCard(cardId);

    // Publish REACTION_UPDATED event
    pubSub.publish(boardId, {
      event: Events.REACTION_UPDATED,
      payload: {
        cardId,
        reactions: allReactions,
      },
    });
  };
}
