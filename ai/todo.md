# Emoji Selection Feature - Implementation TODO

## Phase 1: Domain Layer
- [ ] Extend Card domain model to include emoji selections
- [ ] Add emoji-related events to domain/event.ts
- [ ] Create emoji selection use cases
- [ ] Add emoji selection repository interface

## Phase 2: Database Layer
- [ ] Create emoji_selections table schema
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
