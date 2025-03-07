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
  votes: Record<UserId, number>;
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
    votes: {},
  };
}

export function getTotalVotes(card: Card): number {
  return Object.values(card.votes).reduce(
    (acc: number, cur: number) => acc + cur,
    0,
  );
}
