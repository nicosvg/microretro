import type { ReactionRepository } from "../ports/ReactionRepository";
import type { PubSubGateway } from "../ports/PubSubGateway";
import type { CardId } from "@domain/card";
import type { UserId } from "@domain/user";
import type { BoardId } from "@domain/board";
import type { Emoji, Reaction } from "@domain/reaction";
import { Events } from "@domain/event";

export function addReaction(
  reactionRepo: ReactionRepository,
  pubSub: PubSubGateway,
) {
  return async function (
    boardId: BoardId,
    cardId: CardId,
    emoji: Emoji,
    userId: UserId
  ): Promise<Reaction> {
    // Add the reaction (this handles upsert logic)
    const reaction = await reactionRepo.addReaction(cardId, emoji, userId);

    // Get all reactions for this card to publish
    const allReactions = await reactionRepo.getReactionsByCard(cardId);

    // Publish REACTION_UPDATED event
    pubSub.publish(boardId, {
      event: Events.REACTION_UPDATED,
      payload: {
        cardId,
        reactions: allReactions,
      },
    });

    return reaction;
  };
}
