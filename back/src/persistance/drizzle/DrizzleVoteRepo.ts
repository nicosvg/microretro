import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { cards, users, votes } from "./schema";
import type { VoteRepository } from "../../core/ports/VoteRepository";
import type { CardId } from "@domain/card";
import type { UserId } from "@domain/user";
import { eq, and } from "drizzle-orm";

export class DrizzleVoteRepo implements VoteRepository {
  constructor(private db: NodePgDatabase) {}
  public async addVote(
    cardId: CardId,
    userId: UserId,
    value: number,
  ): Promise<void> {
    console.log("selecting existing vote");
    const res = await this.db
      .select()
      .from(votes)
      .where(and(eq(votes.userId, userId), eq(votes.cardId, cardId)));
    console.log(res);
    if (res.length === 0) {
      console.log("inserting vote");
      await this.db.insert(votes).values({ votes: value, cardId, userId });
      return;
    }
    await this.db
      .update(votes)
      .set({ votes: res[0].votes + value })
      .where(and(eq(votes.userId, userId), eq(votes.cardId, cardId)));
  }
}
