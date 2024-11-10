import type { MessageData } from "@domain/events";

export interface PubSubGateway {
  publish(channel: string, message: MessageData): void;
  subscribe(channel: string, callback: (message: any) => void): string;
}
