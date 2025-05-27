import type { Card, CardId } from "@domain/card";
import type { GroupId } from "@domain/group";
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { CardRepository } from "../../core/ports/CardRepository";
import { cards } from "./schema";

export class DrizzleCardRepo implements CardRepository {
  constructor(private db: NodePgDatabase) {}
  async getCards(groupId: GroupId): Promise<Card[]> {
    const res = await this.db.select().from(cards).where(eq(cards.groupId, groupId));
    return res as Card[];
  }
  async getCard(id: CardId): Promise<Card> {
    const res = await this.db.select().from(cards).where(eq(cards.id, id));
    return res[0] as Card;
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
