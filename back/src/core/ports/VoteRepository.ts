import type { CardId } from "@domain/card";
import type { UserId } from "@domain/user";

export interface VoteRepository {
  addVote: (cardId: CardId, userId: UserId, value: number) => Promise<void>;
}