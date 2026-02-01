# Repository Guidelines

## Project Structure & Module Organization
`src/` holds the React + TypeScript app. Key areas include `src/components/`, `src/pages/`, `src/hooks/`, `src/services/`, `src/types/`, and `src/utils/`. Static assets live in `src/assets/` and global styles in `src/styles/index.css` (Tailwind layers + custom classes). `public/` contains static files served as-is. Supabase config and migrations live under `supabase/`. Build output goes to `dist/`.

## Build, Test, and Development Commands
- `npm run dev` starts the Vite dev server with HMR.
- `npm run build` runs TypeScript project build then `vite build` for production output.
- `npm run preview` serves the production build locally.
- `npm run lint` runs ESLint over the repo.

## Coding Style & Naming Conventions
- Language: TypeScript + React (TSX). Use 2-space indentation as seen in existing files.
- Components use `PascalCase` filenames (e.g., `QuizCard.tsx`); hooks use `useX` naming (e.g., `useAuth.ts`).
- Prefer Tailwind utility classes; reusable patterns can be added to `@layer components` in `src/styles/index.css`.
- Run `npm run lint` before pushing to keep ESLint clean.

## Testing Guidelines
There are no automated tests configured yet (no `*.test.*` or `*.spec.*` files). If you add tests, follow a `*.test.ts(x)` naming scheme and document the runner/command in `package.json`.

## Commit & Pull Request Guidelines
Recent history uses Conventional Commits (e.g., `feat: ...`, `fix: ...`). Use the same format, optionally with a scope (`feat(auth): ...`). PRs should include:
- A clear summary and testing notes (commands run).
- Screenshots for UI changes.
- Linked issue/ticket when applicable.

## Security & Configuration Tips
Supabase credentials are loaded from `.env.local` (see `.env.example`). Do not commit secrets. When adding new env vars, update `.env.example` with placeholders and document usage in the PR description.
