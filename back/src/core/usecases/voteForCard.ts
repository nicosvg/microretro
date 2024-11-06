import type { CardId } from "@domain/card";
import type { UserId } from "@domain/user";
import type { VoteRepository } from "../ports/VoteRepository";

export function voteForCard(voteRepo: VoteRepository) {
  return async (cardId: CardId, userId: UserId, value: number) => {
    await voteRepo.addVote(cardId, userId, value);
  };
}
