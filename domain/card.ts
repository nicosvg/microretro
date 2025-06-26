import type { BoardId } from "./board";
import type { GroupId } from "./group";
import type { UserId } from "./user";

export type CardId = string;

export interface Card {
  id: CardId;
  text: string;
  userId: UserId;
  boardId: BoardId;
  column: number;
  createdAt: Date;
  votes: Record<UserId, number>;
  emojiSelections: Record<UserId, string>;
  groupId: GroupId | null;
}

export function newCard(
  text: string,
  userId: UserId,
  boardId: BoardId,
  column: number,
  id: CardId,
  groupId: GroupId | null = null,
): Card {
  return {
    id,
    text,
    userId,
    boardId,
    column: column || 0,
    createdAt: new Date(),
    groupId,
    votes: {},
    emojiSelections: {},
  };
}

export function getTotalVotes(card: Card): number {
  return Object.values(card.votes).reduce(
    (acc: number, cur: number) => acc + cur,
    0,
  );
}

export function getEmojiCounts(card: Card): Record<string, number> {
  const counts: Record<string, number> = {};
  Object.values(card.emojiSelections).forEach((emoji) => {
    counts[emoji] = (counts[emoji] || 0) + 1;
  });
  return counts;
}

export function getSortedEmojis(card: Card): Array<{ emoji: string; count: number }> {
  const counts = getEmojiCounts(card);
  return Object.entries(counts)
    .map(([emoji, count]) => ({ emoji, count }))
    .sort((a, b) => b.count - a.count);
}
