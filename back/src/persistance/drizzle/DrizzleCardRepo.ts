import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { cards } from "./schema";
import type { Card } from "../../core/domain/card";
import type { CardRepository } from "../../core/ports/CardRepository";

export class DrizzleCardRepo implements CardRepository {
  constructor(private db: NodePgDatabase) { }
  async createCard(card: Card): Promise<void> {
    await this.db.insert(cards).values(card)
    return
  }
}
