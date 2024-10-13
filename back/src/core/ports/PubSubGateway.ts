export enum PubSubEvent {
  CREATED_CARD = 'CREATED_CARD',
}

export interface MessageData {
  event: PubSubEvent;
  payload: unknown;
}

export interface PubSubGateway {
  publish(channel: string, message: MessageData): void;
}

