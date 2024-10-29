import type { Card } from "./card";
import type { User } from "./user";

export type BoardId = string;

export interface Board {
  id: BoardId;
  createdAt: Date;
  cards: Card[];
  users: User[];
  state: BoardState;
}

export enum BoardState {
  WRITE = "write",
  PRESENT = "present",
  VOTE = "vote",
  DISCUSS = "discuss",
  DONE = "done",
}

export function getNextState(current: BoardState): BoardState {
  switch (current) {
    case BoardState.WRITE:
      return BoardState.PRESENT;
    case BoardState.PRESENT:
      return BoardState.VOTE;
    case BoardState.VOTE:
      return BoardState.DISCUSS;
    case BoardState.DISCUSS:
      return BoardState.DONE;
    case BoardState.DONE:
      return BoardState.DONE;
  }
}
