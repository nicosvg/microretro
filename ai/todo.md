# Card Groups Implementation Plan

## Backend Changes

- [x] Create Group domain model in domain/group.ts
  - id: GroupId (string)
  - title: string
  - boardId: BoardId
  - column: number
  - cardIds: CardId[]
  - createdAt: Date
- [x] Add GroupRepository interface in back/src/core/ports/GroupRepository.ts
  - createGroup(group: Group): Promise<void>
  - updateGroup(group: Group): Promise<void>
  - deleteGroup(groupId: GroupId): Promise<void>
  - getGroup(groupId: GroupId): Promise<Group>
- [ ] Create DrizzleGroupRepo implementation
- [x] Add groupId field to Card interface
- [ ] Update CardRepository to handle group associations
  - updateCardGroup(cardId: CardId, groupId: GroupId | null): Promise<void>
- [ ] Create use cases:
  - createGroup.ts
  - updateGroup.ts
  - deleteGroup.ts
  - addCardToGroup.ts
  - removeCardFromGroup.ts

## Frontend Changes

- [ ] Create Group component
- [ ] Add drag-and-drop functionality for cards
- [ ] Create group creation UI when cards are dropped on each other
- [ ] Add group title editing functionality
- [ ] Update card display to show group association
- [ ] Add API services:
  - createGroup.ts
  - updateGroup.ts
  - deleteGroup.ts
  - addCardToGroup.ts
  - removeCardFromGroup.ts

## Database Changes

- [ ] Add groups table migration
- [ ] Add group_id column to cards table
