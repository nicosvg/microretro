import type { Card } from "./card";
import type { Group } from "./group";
import type { User } from "./user";

export type BoardId = string;

export interface Board {
  id: BoardId;
  createdAt: Date;
  cards: Card[];
  users: User[];
  step: BoardStep;
  groups: Group[];
}

export enum BoardStep {
  WRITE = "write",
  PRESENT = "present",
  VOTE = "vote",
  DISCUSS = "discuss",
  DONE = "done",
}

export function getNextState(current: BoardStep): BoardStep {
  switch (current) {
    case BoardStep.WRITE:
      return BoardStep.PRESENT;
    case BoardStep.PRESENT:
      return BoardStep.VOTE;
    case BoardStep.VOTE:
      return BoardStep.DISCUSS;
    case BoardStep.DISCUSS:
      return BoardStep.DONE;
    case BoardStep.DONE:
      return BoardStep.DONE;
  }
}

export function getPreviousState(current: BoardStep): BoardStep {
  switch (current) {
    case BoardStep.DONE:
      return BoardStep.DISCUSS;
    case BoardStep.DISCUSS:
      return BoardStep.VOTE;
    case BoardStep.VOTE:
      return BoardStep.PRESENT;
    case BoardStep.PRESENT:
      return BoardStep.WRITE;
    case BoardStep.WRITE:
      return BoardStep.WRITE;
  }
}

export function shouldHideCards(boardStep: BoardStep): boolean {
  if (boardStep === BoardStep.WRITE) {
    return true;
  }
  return false;
}
