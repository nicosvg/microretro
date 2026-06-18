# Repository Guidelines

## Project Structure & Module Organization

Microretro is split into small workspaces. `front/` contains the SvelteKit UI, with routes in `front/src/routes`, components in `front/src/lib/components`, API clients in `front/src/lib/services`, and static files in `front/static`. `back/` contains the Bun/Elysia API: use cases live in `back/src/core/usecases`, ports in `back/src/core/ports`, Drizzle persistence in `back/src/persistance/drizzle`, and backend tests in `back/src/core/__tests__`. `domain/` holds shared TypeScript models. `e2e/` contains Playwright tests under `e2e/tests`.

## Build, Test, and Development Commands

- `mprocs`: starts frontend and backend from the root; the database process is defined but not autostarted.
- `docker compose up`: runs Postgres, backend, and frontend in containers.
- `cd front && npm run dev`: starts the SvelteKit dev server.
- `cd front && npm run build`: builds the frontend.
- `cd front && npm run check`: runs `svelte-check` and TypeScript validation.
- `cd front && npm run lint`: checks Prettier formatting and runs `oxlint`.
- `cd back && bun run start`: starts the backend with watch mode.
- `cd back && bun run check`: runs TypeScript with `--noEmit`.
- `cd back && bun run migrate`: applies Drizzle migrations.
- `cd e2e && npx playwright test`: runs browser e2e tests against `http://localhost:5173`.

## Coding Style & Naming Conventions

Use TypeScript throughout. Frontend formatting is governed by `front/.prettierrc`: tabs, single quotes, no trailing commas, and 100-character print width. Name Svelte components in PascalCase, for example `ReactionPicker.svelte`; services and use cases use camelCase, for example `createBoard.ts`. Keep shared shapes in `domain/`.

## Testing Guidelines

Backend unit tests use Bun’s test runner and live in `back/src/core/__tests__`; name files `*.test.ts`. Prefer in-memory repositories from `back/src/core/__tests__/repositories` for use case tests. Frontend has Vitest via `cd front && npm test`. Playwright specs live in `e2e/tests/*.spec.ts`; ensure the app is running first.

## Commit & Pull Request Guidelines

Recent history uses Conventional Commits such as `feat(discuss): sort cards and groups by votes` and `fix(card): elevate z-index on menu/picker open`. Keep subjects imperative and scoped when useful: `docs(changelog): add May entries`. Pull requests should describe the behavior change, list validation commands run, link related issues, and include screenshots or recordings for UI changes.

## Security & Configuration Tips

Use `front/.env.example` as the frontend configuration template. Do not commit local secrets, generated database volumes, or Playwright auth state. Database schema changes should include Drizzle migration files under `back/src/persistance/drizzle/migrations`.
