import type { BoardId } from "../domain/board";
import { newCard, type Card } from "../domain/card";
import type { UserId } from "../domain/user";
import type { CardRepository } from "../ports/CardRepository";

export async function createCard(boardId: BoardId, userId: UserId, text: string, column: number, cardRepo: CardRepository): Promise<Card> {
  const card = newCard(text, userId, boardId, column)
  await cardRepo.createCard(card)
  return card
}
