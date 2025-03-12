# Repository Technology & Practices Summary

## Tech Stack

### Frontend

- **Svelte**: The front directory has a `svelte.config.js` file, indicating a Svelte-based frontend
- **PostCSS**: For CSS processing (`postcss.config.js`)
- **ESLint & Prettier**: For code quality and formatting (`eslint.config.js`, `.prettierrc`)

### Backend

- **Bun**: Used as the JavaScript/TypeScript runtime (`bun.lockb`, `bunfig.toml`)
- **TypeScript**: For type safety (`tsconfig.json`)

### Testing

- **Playwright**: For end-to-end testing (`playwright.config.ts`)

### Infrastructure

- **Docker**: Containerization with separate Dockerfiles for backend and frontend
- **Docker Compose**: For orchestrating the application (`docker-compose.yml`)

## Good Practices

- **Domain-Driven Design**: Separate domain directory with clear entity definitions (`board.ts`, `card.ts`, `user.ts`)
- **Clean Architecture**: Separation of concerns with distinct directories for frontend, backend, domain models, and tests
- **Monorepo Structure**: Organized as a monorepo with individual packages having their own configurations
- **Comprehensive Testing**: Dedicated e2e testing setup
- **Documentation**: Multiple README files throughout the project
- **Containerization**: Proper Docker setup for consistent development and deployment

> The repository appears to be implementing a retrospective meeting tool where users can create boards and cards for retrospective events. Your new feature will add a summary at the end of this retrospective flow.
