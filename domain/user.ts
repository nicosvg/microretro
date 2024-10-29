import type { BoardId } from "./board";

export type UserId = string;

export interface User {
  id: UserId;
  name: string;
  boardIds: BoardId[];
  createdAt: Date;
}

export function newUser(name: string, id: UserId): User {
  return {
    id,
    name,
    boardIds: [],
    createdAt: new Date(),
  };
}
