import { BoardId } from "./board";
import { CardId } from "./card";
import { UserId } from "./user";

export type GroupId = string;

export interface Group {
  id: GroupId;
  boardId: BoardId;
  cardIds: CardId[];
  title: string;
  votes: Record<UserId, number>;
}
