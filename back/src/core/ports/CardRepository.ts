import type { Card, CardId } from "@domain/card";

export interface CardRepository {
  createCard(card: Card): Promise<void>;
  updateCard(id: CardId, text: string): Promise<void>;
  deleteCard(id: CardId): Promise<void>;
  getCard(id: CardId): Promise<Card>;
}
