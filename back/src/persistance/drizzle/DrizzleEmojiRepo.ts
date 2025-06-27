import type { CardId } from "@domain/card";
import type { UserId } from "@domain/user";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { EmojiRepository } from "../../core/ports/EmojiSelectionRepository";
import { emojiSelections } from "./schema";
import { eq, and } from "drizzle-orm";

export class DrizzleEmojiRepo implements EmojiRepository {
    constructor(private db: NodePgDatabase) { }

    public async selectEmoji(
        cardId: CardId,
        userId: UserId,
        emoji: string,
    ): Promise<void> {
        await this.db
            .insert(emojiSelections)
            .values({ emoji, cardId, userId })
            .onConflictDoUpdate({
                target: [emojiSelections.cardId, emojiSelections.userId],
                set: { emoji },
            });
    }

    public async getEmojis(cardId: CardId): Promise<Record<UserId, string>> {
        const selections = await this.db
            .select()
            .from(emojiSelections)
            .where(eq(emojiSelections.cardId, cardId));

        const result: Record<UserId, string> = {};
        selections.forEach((selection) => {
            result[selection.userId] = selection.emoji;
        });

        return result;
    }

    public async removeEmoji(cardId: CardId, userId: UserId): Promise<void> {
        await this.db
            .delete(emojiSelections)
            .where(and(
                eq(emojiSelections.cardId, cardId),
                eq(emojiSelections.userId, userId)
            ));
    }
} 