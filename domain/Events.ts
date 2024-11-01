export const Events = {
  CREATED_CARD: "CREATED_CARD",
  JOINED_BOARD: "JOINED_BOARD",
  CONNECTED: "CONNECTED",
} as const;

export type MessageData = {
  event: (typeof Events)[keyof typeof Events];
  payload: unknown;
};
