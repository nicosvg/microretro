import type { MessageData } from "@domain/event";

export interface PubSubGateway {
  publish(channel: string, message: MessageData): void;
  // Returns a function to unsubscribe from the channel
  subscribe(channel: string, callback: (message: any) => void): () => void;
}
