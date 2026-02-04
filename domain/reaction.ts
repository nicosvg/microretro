import type { CardId } from "./card";
import type { UserId } from "./user";

export type ReactionId = string;
export type Emoji = string;

export interface Reaction {
  id: ReactionId;
  cardId: CardId;
  emoji: Emoji;
  userIds: UserId[];
  createdAt: Date;
  updatedAt: Date;
}

// DTO for frontend (includes count and hasReacted for current user)
export interface ReactionDTO {
  id: ReactionId;
  cardId: CardId;
  emoji: Emoji;
  count: number;
  hasReacted: boolean;
}

// Curated emoji set for reactions (20 total)
export const ALLOWED_EMOJIS = [
  '👍', '👎', '❤️', '😂', '😄',
  '😍', '😢', '😭', '😡', '😠',
  '🤔', '😮', '💡', '🎉', '🔥',
  '⚡', '✨', '💯', '🚀', '✅',
] as const;

export type AllowedEmoji = typeof ALLOWED_EMOJIS[number];

export function isAllowedEmoji(emoji: string): emoji is AllowedEmoji {
  return (ALLOWED_EMOJIS as readonly string[]).includes(emoji);
}

export function toReactionDTO(reaction: Reaction, userId: UserId): ReactionDTO {
  return {
    id: reaction.id,
    cardId: reaction.cardId,
    emoji: reaction.emoji,
    count: reaction.userIds.length,
    hasReacted: reaction.userIds.includes(userId),
  };
}
