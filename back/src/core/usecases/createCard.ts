import type { BoardId } from "../domain/board";
import { newCard, type CardId } from "../domain/card";
import type { UserId } from "../domain/user";
import type { CardRepository } from "../ports/CardRepository";

export async function createCard(boardId: BoardId, userId: UserId, text: string, cardRepo: CardRepository): Promise<CardId> {
  const card = newCard(text, userId, boardId)
  await cardRepo.createCard(card)
  return card.id
}
