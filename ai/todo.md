# Emoji Selection Feature - Implementation TODO

## Phase 1: Domain Layer
- [x] Extend Card domain model to include emoji selections
- [x] Add emoji-related events to domain/event.ts
- [x] Create emoji selection use cases
- [x] Add emoji selection repository interface

## Phase 2: Database Layer
- [ ] Update Drizzle schema with emoji_selections table 
- [ ] Add repository implementation
- [ ] Generate and run migrations with bun generate

## Phase 3: Backend API
- [ ] Add emoji selection endpoints
- [ ] Implement WebSocket event publishing
- [ ] Add to existing API router

## Phase 4: Frontend
- [ ] Update Card component with emoji selector
- [ ] Add emoji selection service
- [ ] Handle real-time updates
- [ ] Update event handling in board page

## Phase 5: Testing
- [ ] Unit tests for domain logic
- [ ] Integration tests for API
- [ ] E2E tests for user workflow
