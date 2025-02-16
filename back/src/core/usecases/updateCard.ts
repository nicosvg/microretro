import { type Card, type CardId } from "@domain/card";
import type { CardRepository } from "../ports/CardRepository";

export async function updateCard(
  cardId: CardId,
  text: string,
  cardRepo: CardRepository,
): Promise<Card> {
  await cardRepo.updateCard(cardId, text);
  return await cardRepo.getCard(cardId);
}
