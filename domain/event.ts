import type { BoardStep } from "./board";
import type { CardId } from "./card";
import type { UserId } from "./user";

export const Events = {
  CREATED_CARD: "CREATED_CARD",
  JOINED_BOARD: "JOINED_BOARD",
  CONNECTED: "CONNECTED",
  CHANGED_STEP: "CHANGED_STEP",
  UPDATED_CARD: "UPDATED_CARD",
  DELETED_CARD: "DELETED_CARD",
  VOTED_FOR_CARD: "VOTED_FOR_CARD",
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
      event: typeof Events.VOTED_FOR_CARD;
      payload: { cardId: CardId; userId: UserId; newValue: number };
    };
