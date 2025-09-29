# Repository Guidelines

## Project Structure & Module Organization
Collavo runs on the Next.js App Router. Route segments and page-level logic live under `app/`, with colocated `loading.tsx`, `layout.tsx`, and route handlers where needed. Shared UI belongs in `components/ui`, while domain-specific widgets sit in feature folders such as `components/dashboard`, `components/members`, and `components/project`. Reusable services, auth helpers, and external integrations reside in `lib/` and `providers/`. Data contracts and Drizzle ORM schema live in `db/`, and cross-cutting helpers with their Jest-style specs live in `utils/` and `utils/__tests__`. Static assets go in `public/`, and scheduled maintenance tasks (for example `scripts/cleanup-invitations.ts`) should remain in `scripts/`. Keep background docs and RFCs in `documentation/` to stay consistent.

## Build, Test, and Development Commands
Use `npm run dev` for the local development server and hot reloading. Ship-ready bundles come from `npm run build`, and `npm run start` serves the compiled output for smoke tests. Run `npm run lint` before every PR; it executes `next lint` with the repository ESLint rules. Database changes originate from `db/schema.ts`; run `npx drizzle-kit push` once `DATABASE_URL` is configured to sync schema migrations.

## Coding Style & Naming Conventions
Write new code in TypeScript and prefer React Server Components unless a hook or browser API requires "use client". Follow the prevailing two-space indentation and keep imports ordered: external packages, aliases, then relative paths. Name components in PascalCase, hooks in camelCase with a `use` prefix, and utility modules in kebab-case (for example `timezone.ts`). Tailwind class lists should read roughly layout -> spacing -> color -> state, matching existing files. Lint warnings must be resolved or commented with justification, and console statements should be temporary; ESLint elevates `console` to a warning.

## Testing Guidelines
Unit coverage currently centers on time utilities in `utils/__tests__`. Mirror that structure for new modules, naming files `*.test.ts` and keeping Arrange-Act-Assert blocks clear. Stick to Jest-style `describe` and `it` semantics and favor deterministic fixtures over real timers. Until a formal runner is wired into `package.json`, execute suites with a Jest-compatible runner (Vitest is the preferred option) and document the command you used in the PR description. Avoid snapshots unless they capture meaningful regressions. Expand coverage around Drizzle queries and React server actions whenever you touch those areas.

## Commit & Pull Request Guidelines
Recent history favors concise, imperative subject lines (for example `Enhance project and member deletion with safety checks`). Use scope keywords only when they clarify the blast radius. Each PR should include a summary of intent, linked Linear or GitHub issue IDs, risk callouts, and screenshots or screen recordings for UI-visible changes. Draft PRs early, but mark them ready only after lint and targeted tests pass locally.
