# AI TODO

## Domain

- [x] **domain/board.ts:** Add `GROUP` to the `BoardStep` enum.
- [x] **domain/group.ts:** Create this file. Add properties for `id`, `boardId`, `cardIds`, `title`, and `votes`.

## Backend

- [x] **back/src/core/ports/BoardRepository.ts:** Add methods to get, create, and update groups.
- [x] **back/src/core/ports/GroupRepository.ts:** Create this interface with methods to create, update, get, and delete a group.
- [x] **back/src/persistance/drizzle/DrizzleGroupRepo.ts:** Implement the `GroupRepository` interface.
- [x] **back/src/core/ports/VoteRepository.ts:** Update the `addVote` method to accept a `groupId` (optional).  Update other methods as needed to work with groups.
- [x] **back/src/persistance/drizzle/DrizzleVoteRepo.ts:** Update the implementation to handle group votes, likely by adding a `groupId` column to the `votes` table.
- [ ] **back/src/core/usecases:** Create new use cases for creating, updating, and getting groups. Create `voteForGroup.ts`.  Update existing use cases as needed.
- [ ] **back/src/api/elysiaRouter.ts:** Add new API routes for creating, updating, getting, and deleting groups. Add an API route for voting on a group. Update existing routes as needed.
- [ ] **back/src/persistance/drizzle/schema.ts:** Update the schema to include the `groups` table and update the `votes` table to include the optional `groupId` column.

## Frontend

- [ ] **front/src/routes/retro/[id]/+page.svelte:** Update the UI to support the new grouping step. Add functionality to create, rename, and delete groups.  Disable card voting within groups and implement group voting. Update how votes are displayed.
- [ ] **front/src/routes/retro/[id]/+page.ts:** Update the component logic to handle the new grouping step and group interactions.
- [ ] **front/src/lib/services:** Create new services for creating, updating, getting, and deleting groups. Create `voteForGroup.ts`. Update existing services as needed.
