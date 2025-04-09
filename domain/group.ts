import type { BoardId } from "./board";
import type { CardId } from "./card";

export type GroupId = string;

export interface Group {
  id: GroupId;
  title: string;
  boardId: BoardId;
  column: number;
  cardIds: CardId[];
  createdAt: Date;
}

export function newGroup(boardId: BoardId, column: number, id: GroupId): Group {
  return {
    id,
    title: "",
    boardId,
    column,
    cardIds: [],
    createdAt: new Date(),
  };
}
