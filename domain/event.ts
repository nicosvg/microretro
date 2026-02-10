import { BoardStep } from "./board";
import type { CardId } from "./card";
import type { Group } from "./group";
import type { UserId } from "./user";
import type { Reaction } from "./reaction";

export const Events = {
  CREATED_CARD: "CREATED_CARD",
  JOINED_BOARD: "JOINED_BOARD",
  CONNECTED: "CONNECTED",
  CHANGED_STEP: "CHANGED_STEP",
  UPDATED_CARD: "UPDATED_CARD",
  DELETED_CARD: "DELETED_CARD",
  VOTED_FOR_CARD: "VOTED_FOR_CARD",
  CREATED_GROUP: "CREATED_GROUP",
  DELETED_GROUP: "DELETED_GROUP",
  USER_READY: "USER_READY",
  USER_UNREADY: "USER_UNREADY",
  REACTION_UPDATED: "REACTION_UPDATED",
} as const;

export type MessageData =
  | {
    event: typeof Events.CREATED_CARD;
    payload: unknown;
  }
  | {
    event: typeof Events.UPDATED_CARD;
    payload: unknown;
  }
  | {
    event: typeof Events.JOINED_BOARD;
    payload: unknown;
  }
  | {
    event: typeof Events.CONNECTED;
    payload: unknown;
  }
  | {
    event: typeof Events.CHANGED_STEP;
    payload: { step: BoardStep };
  }
  | {
    event: typeof Events.DELETED_CARD;
    payload: { cardId: CardId };
  }
  | {
    event: typeof Events.CREATED_GROUP;
    payload: { group: Group };
  }
  | {
    event: typeof Events.DELETED_GROUP;
    payload: { groupId: string };
  }
  | {
    event: typeof Events.VOTED_FOR_CARD;
    payload: { cardId: CardId; userId: UserId; newValue: number };
  }
  | {
    event: typeof Events.USER_READY;
    payload: { userId: UserId };
  }
  | {
    event: typeof Events.USER_UNREADY;
    payload: { userId: UserId };
  }
  | {
    event: typeof Events.REACTION_UPDATED;
    payload: { cardId: CardId; reactions: Reaction[] };
  };
