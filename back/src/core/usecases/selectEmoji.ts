import type { CardId } from "@domain/card";
import type { UserId } from "@domain/user";
import type { EmojiRepository } from "../ports/EmojiSelectionRepository";

export function selectEmoji(emojiRepo: EmojiRepository) {
    return async (cardId: CardId, userId: UserId, emoji: string) => {
        await emojiRepo.selectEmoji(cardId, userId, emoji);
    };
} 