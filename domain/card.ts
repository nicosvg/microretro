import type { BoardId } from "./board";
import type { UserId } from "./user";

export type CardId = string;

export interface Card {
  id: CardId;
  text: string;
  userId: UserId;
  boardId: BoardId;
  column: number;
  createdAt: Date;
}

export function newCard(
  text: string,
  userId: UserId,
  boardId: BoardId,
  column: number,
  id: CardId,
): Card {
  return {
    id,
    text,
    userId,
    boardId,
    column: column || 0,
    createdAt: new Date(),
  };
}
