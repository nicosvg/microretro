import type { CardId } from "@domain/card";
import type { GroupId } from "@domain/group";
import type { UserId } from "@domain/user";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { VoteRepository } from "../../core/ports/VoteRepository";
import { votes } from "./schema";

export class DrizzleVoteRepo implements VoteRepository {
  constructor(private db: NodePgDatabase) {}
  public async addVote(
    cardId: CardId | null,
    userId: UserId,
    newValue: number,
    groupId?: GroupId,
  ): Promise<void> {
    await this.db
      .insert(votes)
      .values({ votes: newValue, cardId, userId, groupId })
      .onConflictDoUpdate({
        target: [votes.cardId, votes.userId, votes.groupId],
        set: { votes: newValue },
      });
  }
}
