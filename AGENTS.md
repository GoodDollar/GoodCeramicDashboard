# Repository Guidelines

## Project Structure & Module Organization
This Strapi dashboard keeps custom behaviour inside `src/plugins/ceramic-feed`, which exposes server hooks and CLI utilities. Core configuration lives in `config/` (database, plugins, middleware) and reads from environment variables. Static assets and the Strapi admin build output go in `public/`. The `database/migrations` folder is reserved for SQL migrations; drop migration scripts there to keep environments in sync.

## Build, Test, and Development Commands
Use Yarn 3.6.1 with Node ≥16. Frequent tasks:
- `yarn develop` runs Strapi in watch mode with a SQLite database by default.
- `yarn start` serves the compiled app in production-like mode.
- `yarn build` rebuilds the admin panel assets.
- `yarn lint` checks JavaScript in `config/` and `src/plugins/ceramic-feed/`.
- `yarn lint:fix` applies auto-fixes from ESLint.
- `yarn generate:ceramic:seed` seeds demo feed data; run it after bootstrapping a new database.
- `yarn client:settings` refreshes Orbis client configuration used by the plugin.
Always create `.env` files rather than editing `config/*.js` directly.

## Coding Style & Naming Conventions
ESLint (`.eslintrc`) enforces 2-space indentation, single quotes, required semicolons, and Unix line endings. Keep module exports CommonJS-style to match Strapi expectations. Prefer `camelCase` for functions/variables, kebab-case for file names, and avoid default exports inside the plugin. Run lint before submitting.

## Testing Guidelines
An automated test harness has not been wired up. For now, smoke-test changes by running `yarn develop`, exercising the Ceramic Feed plugin flows, and invoking CLI utilities. When adding automated coverage, follow Jest conventions (`*.test.js` files alongside the code) and add a `yarn test` script so CI can trigger it. Document manual test steps in pull requests until automated coverage exists.

## Commit & Pull Request Guidelines
Follow the existing Conventional Commit style (`fix:`, `chore:`, `add:`). Scope commits to one concern and mention affected plugin modules. Pull requests should include a brief narrative, screenshots for admin UI tweaks, environment notes (e.g., which storage provider), and a checklist showing lint/tests run. Link Jira or GitHub issues and flag any required secrets.

## Configuration & Security Notes
Sensitive credentials for AWS S3 uploads and Ceramic access come from environment variables (`AWS_*`, `CERAMIC_*`, `WEB3STORAGE_GATEWAY`). Public feed access is gated by `CERAMIC_FEED_ALLOWED_ORIGINS`; keep the list tight and mirror it in any Cloudflare rules. Never commit secrets or `.env` files. Rotate or revoke credentials if a partner key leaks and update `config/plugins.js` to point at the new values.
