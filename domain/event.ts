import { BoardStep } from "./board";

export const Events = {
  CREATED_CARD: "CREATED_CARD",
  JOINED_BOARD: "JOINED_BOARD",
  CONNECTED: "CONNECTED",
  CHANGED_STEP: "CHANGED_STEP",
  UPDATED_CARD: "UPDATED_CARD",
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
    };
