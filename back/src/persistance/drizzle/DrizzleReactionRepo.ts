import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { ReactionRepository } from "../../core/ports/ReactionRepository";
import type { Reaction, Emoji } from "@domain/reaction";
import type { CardId } from "@domain/card";
import type { UserId } from "@domain/user";
import { reactions } from "./schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export class DrizzleReactionRepo implements ReactionRepository {
  constructor(private db: NodePgDatabase) {}

  async getReactionsByCard(cardId: CardId): Promise<Reaction[]> {
    const res = await this.db
      .select()
      .from(reactions)
      .where(eq(reactions.cardId, cardId));
    return res as Reaction[];
  }

  async getReactionsByCards(cardIds: CardId[]): Promise<Map<CardId, Reaction[]>> {
    if (cardIds.length === 0) {
      return new Map();
    }

    const res = await this.db
      .select()
      .from(reactions)
      .where(inArray(reactions.cardId, cardIds));

    const reactionMap = new Map<CardId, Reaction[]>();
    for (const reaction of res as Reaction[]) {
      const existing = reactionMap.get(reaction.cardId) || [];
      existing.push(reaction);
      reactionMap.set(reaction.cardId, existing);
    }

    return reactionMap;
  }

  async getReaction(cardId: CardId, emoji: Emoji): Promise<Reaction | null> {
    const res = await this.db
      .select()
      .from(reactions)
      .where(and(eq(reactions.cardId, cardId), eq(reactions.emoji, emoji)));

    return res.length > 0 ? (res[0] as Reaction) : null;
  }

  async addReaction(cardId: CardId, emoji: Emoji, userId: UserId): Promise<Reaction> {
    const now = new Date();

    // Try to get existing reaction
    const existing = await this.getReaction(cardId, emoji);

    if (existing) {
      // If user already reacted with this emoji, just return existing
      if (existing.userIds.includes(userId)) {
        return existing;
      }

      // Add user to userIds array
      const updatedUserIds = [...existing.userIds, userId];
      const res = await this.db
        .update(reactions)
        .set({
          userIds: updatedUserIds,
          updatedAt: now,
        })
        .where(and(
          eq(reactions.cardId, cardId),
          eq(reactions.emoji, emoji)
        ))
        .returning();

      return res[0] as Reaction;
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

      await this.db.insert(reactions).values(newReaction);
      return newReaction;
    }
  }

  async removeReaction(cardId: CardId, userId: UserId): Promise<void> {
    // Find all reactions for this card that include this user
    const cardReactions = await this.getReactionsByCard(cardId);
    const userReaction = cardReactions.find(r => r.userIds.includes(userId));

    if (!userReaction) {
      return; // User hasn't reacted, nothing to do
    }

    // Remove user from userIds array
    const updatedUserIds = userReaction.userIds.filter(id => id !== userId);

    if (updatedUserIds.length === 0) {
      // If no users left, delete the reaction row
      await this.db
        .delete(reactions)
        .where(and(
          eq(reactions.cardId, cardId),
          eq(reactions.emoji, userReaction.emoji)
        ));
    } else {
      // Update with filtered userIds
      await this.db
        .update(reactions)
        .set({
          userIds: updatedUserIds,
          updatedAt: new Date(),
        })
        .where(and(
          eq(reactions.cardId, cardId),
          eq(reactions.emoji, userReaction.emoji)
        ));
    }
  }

  async deleteReactionsByCard(cardId: CardId): Promise<void> {
    await this.db
      .delete(reactions)
      .where(eq(reactions.cardId, cardId));
  }
}
