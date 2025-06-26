# System Patterns

## Architecture Overview
Microretro follows a **full-stack TypeScript** architecture with clear separation between frontend, backend, and domain layers.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (SvelteKit)   │◄──►│   (Elysia)      │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   WebSocket     │    │   Domain Layer  │
│   (Real-time)   │    │   (Pure Logic)  │
└─────────────────┘    └─────────────────┘
```

## Key Design Patterns

### 1. Domain-Driven Design (DDD)
- **Domain layer**: Pure business logic in `domain/` directory
- **Ports and Adapters**: Clear interfaces between layers
- **Repository pattern**: Data access abstraction
- **Use cases**: Business operations as first-class citizens

### 2. Clean Architecture
- **Dependency inversion**: Domain doesn't depend on infrastructure
- **Repository interfaces**: Defined in domain, implemented in infrastructure
- **Use case orchestration**: Business logic coordination

### 3. Event-Driven Communication
- **WebSocket events**: Real-time updates across clients
- **Pub/Sub pattern**: Decoupled event publishing and subscription
- **Event sourcing**: State changes through event sequences

### 4. Repository Pattern
```typescript
// Interface (Port)
interface CardRepository {
  createCard(card: Card): Promise<void>;
  getCards(groupId: GroupId): Promise<Card[]>;
  // ...
}

// Implementation (Adapter)
class DrizzleCardRepo implements CardRepository {
  // Database-specific implementation
}
```

## Component Relationships

### Domain Entities
- **Board**: Main container for retrospective session
- **Card**: Individual retrospective item
- **User**: Participant in the retrospective
- **Group**: Organization of cards (e.g., "Went Well", "Needs Improvement")
- **Vote**: User preference for card importance

### Use Cases
- **CreateBoard**: Initialize new retrospective session
- **JoinBoard**: Add user to existing board
- **CreateCard**: Add retrospective item
- **VoteOnCard**: Express preference for card importance
- **UpdateBoardState**: Progress through retrospective phases

### Infrastructure
- **Drizzle ORM**: Database access and migrations
- **Elysia**: HTTP server and WebSocket handling
- **SvelteKit**: Frontend framework with real-time updates

## Data Flow Patterns

### Real-time Updates
1. User action triggers use case
2. Use case updates domain state
3. Repository persists changes
4. Event published via WebSocket
5. All connected clients receive update
6. Frontend updates UI state

### State Management
- **Server**: Single source of truth in database
- **Client**: Optimistic updates with server confirmation
- **WebSocket**: Real-time synchronization
- **Error handling**: Rollback on conflicts

## Testing Strategy
- **Unit tests**: Domain logic and use cases
- **Integration tests**: Repository implementations
- **E2E tests**: Full user workflows
- **In-memory repositories**: Fast, isolated testing 