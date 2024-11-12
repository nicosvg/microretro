import type { MessageData } from "@domain/event";

export interface PubSubGateway {
  publish(channel: string, message: MessageData): void;
  subscribe(channel: string, callback: (message: any) => void): string;
}
