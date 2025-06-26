# Technical Context

## Technology Stack

### Frontend
- **SvelteKit**: Full-stack web framework
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **WebSocket**: Real-time communication

### Backend
- **Elysia**: Fast TypeScript web framework
- **TypeScript**: Type-safe development
- **Drizzle ORM**: Type-safe database access
- **PostgreSQL**: Primary database
- **PubSub**: Event publishing system

### Domain Layer
- **TypeScript**: Pure business logic
- **Domain entities**: Board, Card, User, Group, Vote
- **Repository interfaces**: Data access contracts
- **Use cases**: Business operation orchestration

### Development Tools
- **Docker**: Containerized development environment
- **Drizzle Kit**: Database migration management
- **Playwright**: End-to-end testing
- **ESLint/Prettier**: Code quality and formatting

## Development Setup

### Prerequisites
- Node.js (latest LTS)
- Docker and Docker Compose
- PostgreSQL (via Docker)

### Environment Variables
```bash
DB_PASSWORD=your_password
DB_HOST=localhost
```

### Database Schema
- **board**: Retrospective sessions
- **user**: Participants
- **card**: Retrospective items
- **group**: Card organization
- **vote**: User preferences
- **user_board**: Many-to-many relationship

## Project Structure
```
microretro/
├── ai/memory/          # Memory bank documentation
├── back/               # Backend application
│   ├── src/
│   │   ├── api/        # HTTP/WebSocket endpoints
│   │   ├── core/       # Domain logic and use cases
│   │   ├── persistance/# Database layer
│   │   └── ai/         # AI integration
├── domain/             # Shared domain types
├── front/              # Frontend application
│   ├── src/
│   │   ├── lib/        # Shared components
│   │   └── routes/     # Page routes
└── e2e/                # End-to-end tests
```

## Key Dependencies

### Backend
- `elysia`: Web framework
- `drizzle-orm`: Database ORM
- `postgres`: Database driver
- `pubsub-js`: Event system

### Frontend
- `svelte`: UI framework
- `sveltekit`: Full-stack framework
- `tailwindcss`: Styling
- `@domain/*`: Shared types

### Development
- `typescript`: Type safety
- `drizzle-kit`: Database migrations
- `playwright`: E2E testing
- `docker-compose`: Local development

## Deployment
- **Docker containers**: Backend and frontend
- **PostgreSQL**: Persistent database
- **Environment-based configuration**: Development vs production

## Performance Considerations
- **WebSocket connections**: Efficient real-time updates
- **Database queries**: Optimized with Drizzle
- **Frontend bundling**: SvelteKit optimizations
- **Caching**: Minimal, real-time focus 