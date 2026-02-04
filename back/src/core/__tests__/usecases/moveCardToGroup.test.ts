import { newCard } from '@domain/card';
import { newGroup } from '@domain/group';
import { beforeEach, describe, expect, test } from 'bun:test';
import { v4 as uuidv4 } from 'uuid';
import { moveCardToGroup } from '../../usecases/moveCardToGroup';
import {
    InMemoryCardRepository,
    InMemoryGroupRepository
} from '../repositories';

describe('moveCardToGroup usecase', () => {
    const cardRepo = new InMemoryCardRepository();
    const groupRepo = new InMemoryGroupRepository();
    const moveCard = moveCardToGroup(groupRepo, cardRepo);

    const boardId = 'board-123';
    const userId = 'user-123';

    beforeEach(() => {
        cardRepo.reset();
        groupRepo.reset();
    });

    test('should move a card to a new group when destination card has no group', async () => {
        // Arrange
        const sourceCardId = uuidv4();
        const destinationCardId = uuidv4();

        const sourceCard = newCard('Source card', userId, boardId, 0, sourceCardId);
        const destinationCard = newCard('Destination card', userId, boardId, 0, destinationCardId);

        cardRepo.setCards([sourceCard, destinationCard]);

        // Act
        const { createdGroup: newGroupResult } = await moveCard(boardId, sourceCardId, destinationCardId);

        // Assert
        expect(newGroupResult).not.toBeNull();
        expect(newGroupResult?.cardIds).toContain(sourceCardId);
        expect(newGroupResult?.cardIds).toContain(destinationCardId);
        expect(newGroupResult?.boardId).toBe(boardId);

        // Check that the destination card now has the group ID set
        const updatedDestinationCard = await cardRepo.getCard(destinationCardId);
        expect(updatedDestinationCard.groupId).toBe(newGroupResult!.id);

        // Verify that the group was persisted
        const group = await groupRepo.getGroup(newGroupResult!.id);
        expect(group).not.toBeNull();
        expect(group!.boardId).toBe(boardId);
    });

    test('should move a card to an existing group when destination card already has a group', async () => {
        // Arrange
        const sourceCardId = uuidv4();
        const destinationCardId = uuidv4();
        const existingGroupId = uuidv4();

        const sourceCard = newCard('Source card', userId, boardId, 0, sourceCardId);
        const destinationCard = newCard('Destination card', userId, boardId, 0, destinationCardId, existingGroupId);
        const existingGroup = newGroup(boardId, 0, existingGroupId);
        existingGroup.cardIds.push(destinationCardId);

        cardRepo.setCards([sourceCard, destinationCard]);
        groupRepo.setGroups([existingGroup]);

        // Act
        const { createdGroup: result, updatedSourceCard } = await moveCard(boardId, sourceCardId, destinationCardId);

        // Assert
        expect(result).toBeNull(); // No new group should be created

        // Check that updateCardGroup was called with the correct parameters
        // We need to verify that the card repository's updateCardGroup method was called
        const updatedSourceCardFromDB = await cardRepo.getCard(sourceCardId);
        expect(updatedSourceCardFromDB.groupId).toBe(existingGroupId);
        expect(updatedSourceCard.groupId).toBe(existingGroupId)
    });

    test('should clean up source group when checking for emptiness', async () => {
        // Arrange
        const sourceCardId = uuidv4();
        const destinationCardId = uuidv4();
        const sourceGroupId = uuidv4();

        // Create source card in a group by itself
        const sourceCard = newCard('Source card', userId, boardId, 0, sourceCardId, sourceGroupId);
        const sourceGroup = newGroup(boardId, 0, sourceGroupId);

        // Create destination card with no group
        const destinationCard = newCard('Destination card', userId, boardId, 0, destinationCardId);
        const destinationGroup = newGroup(boardId, 1, uuidv4());

        cardRepo.setCards([sourceCard, destinationCard]);
        groupRepo.setGroups([sourceGroup]);

        // Act
        await moveCard(boardId, sourceCardId, destinationCardId);

        // Assert
        // The test now just checks if deleteGroup was called for the source group
        // We can mock this by checking if the source group is no longer in the repo
        const allGroups = groupRepo.getAll();
        expect(allGroups.find(g => g.id === sourceGroupId)).toBeUndefined();
    });

    test('should not delete source group if it still has cards after move', async () => {
        // Arrange
        const sourceCardId = uuidv4();
        const otherCardId = uuidv4();
        const destinationCardId = uuidv4();
        const sourceGroupId = uuidv4();

        // Create source card in a group with another card
        const sourceCard = newCard('Source card', userId, boardId, 0, sourceCardId, sourceGroupId);
        const otherCard = newCard('Other card', userId, boardId, 0, otherCardId, sourceGroupId);
        const sourceGroup = newGroup(boardId, 0, sourceGroupId);
        sourceGroup.cardIds = [sourceCardId, otherCardId];

        // Create destination card with no group
        const destinationCard = newCard('Destination card', userId, boardId, 0, destinationCardId);

        // Mock the getCards to return cards to simulate the group still having cards
        const originalGetCards = cardRepo.getCards;
        cardRepo.getCards = async (groupId: string) => {
            if (groupId === sourceGroupId) {
                return [otherCard]; // The group still has the otherCard
            }
            return originalGetCards.call(cardRepo, groupId);
        };

        cardRepo.setCards([sourceCard, otherCard, destinationCard]);
        groupRepo.setGroups([sourceGroup]);

        // Act
        const { createdGroup } = await moveCard(boardId, sourceCardId, destinationCardId);

        // Assert
        // Source group should still exist
        const allGroups = groupRepo.getAll();
        expect(allGroups.find(g => g.id === sourceGroupId)).not.toBeUndefined();

        // New group should be created 
        expect(createdGroup).not.toBeNull();
        expect(createdGroup?.cardIds).toContain(sourceCardId);
        expect(createdGroup?.cardIds).toContain(destinationCardId);

        // Restore the original getCards method
        cardRepo.getCards = originalGetCards;
    });
});
