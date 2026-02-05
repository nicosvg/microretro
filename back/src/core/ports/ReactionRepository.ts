import type { Reaction, ReactionId, Emoji } from "@domain/reaction";
import type { CardId } from "@domain/card";
import type { UserId } from "@domain/user";

export interface ReactionRepository {
  // Get all reactions for a card
  getReactionsByCard(cardId: CardId): Promise<Reaction[]>;

  // Get all reactions for multiple cards (batch fetch)
  getReactionsByCards(cardIds: CardId[]): Promise<Map<CardId, Reaction[]>>;

  // Add user's reaction (upsert: add user to userIds if not present)
  addReaction(cardId: CardId, emoji: Emoji, userId: UserId): Promise<Reaction>;

  // Remove user's reaction from a card (remove user from userIds)
  removeReaction(cardId: CardId, emoji: Emoji, userId: UserId): Promise<void>;

  // Get a specific reaction by card and emoji
  getReaction(cardId: CardId, emoji: Emoji): Promise<Reaction | null>;

  // Delete all reactions for a card (called on card deletion via CASCADE)
  deleteReactionsByCard(cardId: CardId): Promise<void>;
}
