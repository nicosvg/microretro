import type { BoardId } from "@domain/board";
import { type Card, newCard } from "@domain/card";
import type { UserId } from "@domain/user";
import type { CardRepository } from "../ports/CardRepository";
import { v4 as uuid } from "uuid";

export async function createCard(
  boardId: BoardId,
  userId: UserId,
  text: string,
  column: number,
  cardRepo: CardRepository,
): Promise<Card> {
  const cardId = uuid();
  const card = newCard(text, userId, boardId, column, cardId);
  await cardRepo.createCard(card);
  return card;
}
