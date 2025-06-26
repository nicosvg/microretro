import type { CardId } from "@domain/card";
import type { UserId } from "@domain/user";

export interface EmojiRepository {
    selectEmoji(cardId: CardId, userId: UserId, emoji: string): Promise<void>;
    getEmojis(cardId: CardId): Promise<Record<UserId, string>>;
    removeEmoji(cardId: CardId, userId: UserId): Promise<void>;
} 