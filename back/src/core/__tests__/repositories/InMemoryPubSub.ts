import type { MessageData } from "@domain/event";
import type { PubSubGateway } from "../../ports/PubSubGateway";

export class InMemoryPubSub implements PubSubGateway {
  private subscriptions: Map<string, Map<string, (message: any) => void>> = new Map();
  private subscriptionCounter = 0;

  publish(channel: string, message: MessageData): void {
    const channelSubscriptions = this.subscriptions.get(channel);
    if (channelSubscriptions) {
      channelSubscriptions.forEach((callback) => {
        callback(message);
      });
    }
  }

  subscribe(channel: string, callback: (message: any) => void): string {
    const subscriptionId = `sub-${++this.subscriptionCounter}`;

    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Map());
    }

    this.subscriptions.get(channel)!.set(subscriptionId, callback);

    return subscriptionId;
  }

  // Test helper methods
  reset(): void {
    this.subscriptions.clear();
    this.subscriptionCounter = 0;
  }

  unsubscribe(channel: string, subscriptionId: string): void {
    const channelSubscriptions = this.subscriptions.get(channel);
    if (channelSubscriptions) {
      channelSubscriptions.delete(subscriptionId);
    }
  }
}
