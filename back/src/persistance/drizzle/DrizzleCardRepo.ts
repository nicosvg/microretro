import type { Card, CardId } from "@domain/card";
import type { GroupId } from "@domain/group";
import type { UserId } from "@domain/user";
import { eq, inArray } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { CardRepository } from "../../core/ports/CardRepository";
import { cards, votes } from "./schema";

export class DrizzleCardRepo implements CardRepository {
  constructor(private db: NodePgDatabase) {}

  private buildCard(
    row: { id: string; createdAt: Date; userId: string; boardId: string; text: string | null; column: number | null; groupId: GroupId | null },
    cardVotes: { userId: string; votes: number; cardId: string }[],
  ): Card {
    const votesMap: Record<UserId, number> = {};
    cardVotes.filter((v) => v.cardId === row.id).forEach((v) => {
      if (!votesMap[v.userId]) votesMap[v.userId] = 0;
      votesMap[v.userId] += v.votes;
    });
    return { ...row, text: row.text || "", column: row.column || 0, votes: votesMap, groupId: row.groupId };
  }

  async getCards(groupId: GroupId): Promise<Card[]> {
    const rows = await this.db.select().from(cards).where(eq(cards.groupId, groupId));
    if (rows.length === 0) return [];
    const cardVotes = await this.db.select().from(votes).where(inArray(votes.cardId, rows.map((c) => c.id)));
    return rows.map((r) => this.buildCard(r, cardVotes));
  }

  async getCard(id: CardId): Promise<Card> {
    const rows = await this.db.select().from(cards).where(eq(cards.id, id));
    const cardVotes = await this.db.select().from(votes).where(eq(votes.cardId, id));
    return this.buildCard(rows[0], cardVotes);
  }

  async createCard(card: Card): Promise<void> {
    await this.db.insert(cards).values(card);
  }

  async updateCard(id: CardId, text: string): Promise<void> {
    await this.db.update(cards).set({ text }).where(eq(cards.id, id));
  }

  async deleteCard(id: CardId): Promise<void> {
    await this.db.delete(cards).where(eq(cards.id, id));
  }

  async updateCardGroup(cardId: CardId, groupId: GroupId): Promise<void> {
    await this.db.update(cards).set({ groupId }).where(eq(cards.id, cardId));
  }
}
