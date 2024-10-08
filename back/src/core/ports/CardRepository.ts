import type { Card } from "../domain/card";

export interface CardRepository {
  createCard(card: Card): Promise<void>
}
