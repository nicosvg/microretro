import type { CardId } from "@domain/card";
import type { UserId } from "@domain/user";
import type { VoteRepository } from "../../ports/VoteRepository";

export class InMemoryVoteRepository implements VoteRepository {
    private votes: Map<string, number> = new Map();

    async addVote(cardId: CardId, userId: UserId, newValue: number): Promise<void> {
        const key = `${cardId}-${userId}`;
        this.votes.set(key, newValue);
    }

    // Test helper methods
    reset(): void {
        this.votes.clear();
    }

    getVotes(): Map<string, number> {
        return new Map(this.votes);
    }

    getVotesByCard(cardId: CardId): Map<UserId, number> {
        const cardVotes = new Map<UserId, number>();

        for (const [key, value] of this.votes.entries()) {
            if (key.startsWith(`${cardId}-`)) {
                const userId = key.split('-')[1];
                cardVotes.set(userId, value);
            }
        }

        return cardVotes;
    }
}
