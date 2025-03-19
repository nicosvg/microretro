import type { Card, CardId } from "@domain/card";
import type { GroupId } from "@domain/group";

export interface CardRepository {
  createCard(card: Card): Promise<void>;
  updateCard(id: CardId, text: string): Promise<void>;
  deleteCard(id: CardId): Promise<void>;
  getCard(id: CardId): Promise<Card>;
  updateCardGroup(cardId: CardId, groupId: GroupId | null): Promise<void>;
}
