import type { CardId } from "@domain/card";
import type { UserId } from "@domain/user";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { VoteRepository } from "../../core/ports/VoteRepository";
import { votes } from "./schema";

export class DrizzleVoteRepo implements VoteRepository {
  constructor(private db: NodePgDatabase) {}
  public async addVote(
    cardId: CardId,
    userId: UserId,
    newValue: number,
  ): Promise<void> {
    await this.db
      .insert(votes)
      .values({ votes: newValue, cardId, userId })
      .onConflictDoUpdate({
        target: [votes.cardId, votes.userId],
        set: { votes: newValue },
      });
  }
}
