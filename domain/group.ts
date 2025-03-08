import type { BoardId } from "./board";
import type { CardId } from "./card";
import type { UserId } from "./user";

export type GroupId = string;

export interface Group {
  id: GroupId;
  boardId: BoardId;
  cardIds: CardId[];
  title: string;
  votes: Record<UserId, number>;
}
