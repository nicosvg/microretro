import type { ReactionRepository } from "../../ports/ReactionRepository";
import type { Reaction, Emoji } from "@domain/reaction";
import type { CardId } from "@domain/card";
import type { UserId } from "@domain/user";
import { v4 as uuidv4 } from "uuid";

export class InMemoryReactionRepo implements ReactionRepository {
  private reactions: Map<string, Reaction> = new Map();

  async getReactionsByCard(cardId: CardId): Promise<Reaction[]> {
    return Array.from(this.reactions.values())
      .filter(r => r.cardId === cardId)
      .map(r => ({ ...r }));
  }

  async getReactionsByCards(cardIds: CardId[]): Promise<Map<CardId, Reaction[]>> {
    const reactionMap = new Map<CardId, Reaction[]>();

    for (const cardId of cardIds) {
      const cardReactions = await this.getReactionsByCard(cardId);
      if (cardReactions.length > 0) {
        reactionMap.set(cardId, cardReactions);
      }
    }

    return reactionMap;
  }

  async getReaction(cardId: CardId, emoji: Emoji): Promise<Reaction | null> {
    const key = `${cardId}:${emoji}`;
    const reaction = this.reactions.get(key);
    return reaction ? { ...reaction } : null;
  }

  async addReaction(cardId: CardId, emoji: Emoji, userId: UserId): Promise<Reaction> {
    const key = `${cardId}:${emoji}`;
    const existing = this.reactions.get(key);
    const now = new Date();

    if (existing) {
      // If user already reacted with this emoji, just return existing
      if (existing.userIds.includes(userId)) {
        return { ...existing };
      }

      // Add user to userIds array
      const updated: Reaction = {
        ...existing,
        userIds: [...existing.userIds, userId],
        updatedAt: now,
      };
      this.reactions.set(key, updated);
      return { ...updated };
    } else {
      // Create new reaction
      const newReaction: Reaction = {
        id: uuidv4(),
        cardId,
        emoji,
        userIds: [userId],
        createdAt: now,
        updatedAt: now,
      };
      this.reactions.set(key, newReaction);
      return { ...newReaction };
    }
  }

  async removeReaction(cardId: CardId, userId: UserId): Promise<void> {
    // Find the reaction for this card that includes this user
    const cardReactions = Array.from(this.reactions.values())
      .filter(r => r.cardId === cardId && r.userIds.includes(userId));

    if (cardReactions.length === 0) {
      return; // User hasn't reacted
    }

    const userReaction = cardReactions[0];
    const key = `${cardId}:${userReaction.emoji}`;

    // Remove user from userIds array
    const updatedUserIds = userReaction.userIds.filter(id => id !== userId);

    if (updatedUserIds.length === 0) {
      // If no users left, delete the reaction
      this.reactions.delete(key);
    } else {
      // Update with filtered userIds
      const updated: Reaction = {
        ...userReaction,
        userIds: updatedUserIds,
        updatedAt: new Date(),
      };
      this.reactions.set(key, updated);
    }
  }

  async deleteReactionsByCard(cardId: CardId): Promise<void> {
    const keysToDelete: string[] = [];
    for (const [key, reaction] of this.reactions.entries()) {
      if (reaction.cardId === cardId) {
        keysToDelete.push(key);
      }
    }
    for (const key of keysToDelete) {
      this.reactions.delete(key);
    }
  }

  // Test helper methods
  reset(): void {
    this.reactions.clear();
  }

  getAll(): Reaction[] {
    return Array.from(this.reactions.values()).map(r => ({ ...r }));
  }
}
