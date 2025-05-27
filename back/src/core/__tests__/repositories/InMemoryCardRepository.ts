import type { Card, CardId } from "@domain/card";
import type { GroupId } from "@domain/group";
import type { CardRepository } from "../../ports/CardRepository";

export class InMemoryCardRepository implements CardRepository {
    private cards: Map<CardId, Card> = new Map();

    async createCard(card: Card): Promise<void> {
        this.cards.set(card.id, { ...card });
    }

    async updateCard(id: CardId, text: string): Promise<void> {
        const card = this.cards.get(id);
        if (!card) {
            throw new Error(`Card with id ${id} not found`);
        }
        this.cards.set(id, { ...card, text });
    }

    async deleteCard(id: CardId): Promise<void> {
        this.cards.delete(id);
    }

    async getCard(id: CardId): Promise<Card> {
        const card = this.cards.get(id);
        if (!card) {
            throw new Error(`Card with id ${id} not found`);
        }
        return { ...card };
    }

    async getCards(groupId: GroupId): Promise<Card[]> {
        return Array.from(this.cards.values())
            .filter(card => card.groupId === groupId)
            .map(card => ({ ...card }));
    }

    async updateCardGroup(cardId: CardId, groupId: GroupId): Promise<void> {
        const card = this.cards.get(cardId);
        if (!card) {
            throw new Error(`Card with id ${cardId} not found`);
        }
        this.cards.set(cardId, { ...card, groupId });
    }

    // Test helper methods
    reset(): void {
        this.cards.clear();
    }

    setCards(cards: Card[]): void {
        this.reset();
        cards.forEach(card => this.cards.set(card.id, { ...card }));
    }

    getAll(): Card[] {
        return Array.from(this.cards.values()).map(card => ({ ...card }));
    }
}
