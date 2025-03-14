import type { CardId } from "@domain/card";
import type { GroupId } from "@domain/group";
import type { UserId } from "@domain/user";

export interface VoteRepository {
  addVote: (
    cardId: CardId | null,
    userId: UserId,
    newValue: number,
    groupId?: GroupId,
  ) => Promise<void>;
}
