import type { ReactionRepository } from "../ports/ReactionRepository";
import type { CardId } from "@domain/card";
import type { Reaction } from "@domain/reaction";

export function getReactionsByCards(
  reactionRepo: ReactionRepository,
) {
  return async function (cardIds: CardId[]): Promise<Reaction[]> {
    // Get reactions for all provided cards
    const reactionMap = await reactionRepo.getReactionsByCards(cardIds);

    // Flatten the map into a single array
    const allReactions: Reaction[] = [];
    for (const reactions of reactionMap.values()) {
      allReactions.push(...reactions);
    }

    return allReactions;
  };
}
