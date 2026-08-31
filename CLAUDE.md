# CLAUDE.md

## What this is

`ventaris` is a two-part project: a React SPA (`client/`, JavaScript) and an Express JSON API
(`server/`, TypeScript). The client is still the unmodified `create-vite` React template. The
server has a layered structure (routes → controllers → services/repositories) implementing a
small demo marketplace: products (with exact-match search), an in-memory cart, and checkout
into persisted transactions. There are no tests and no CI. Treat anything below that reads
like a convention as a starting point rather than an established pattern.

The two packages are independent npm projects. There is no workspace root, no root
`package.json`, and no shared tooling — install and run each separately.

## Commands

Client (`cd client`):

| Command | Effect |
| --- | --- |
| `npm install` | install deps |
| `npm run dev` | Vite dev server with HMR (default http://localhost:5173) |
| `npm run build` | production build to `client/dist/` |
| `npm run preview` | serve the built `dist/` |
| `npm run lint` | Oxlint (not ESLint) |

Server (`cd server`):

| Command | Effect |
| --- | --- |
| `npm install` | install deps |
| `npm run dev` | tsx watch mode on `src/index.ts` (default http://localhost:3000) |
| `npm run build` | `tsc` compile to `server/dist/` |
| `npm run start` | run the compiled `dist/index.js` |
| `npm run typecheck` | `tsc --noEmit` |

`test` is still the npm placeholder that exits 1 — there are no tests. `nodemon` is a leftover
devDependency; `dev` uses `tsx` instead, so nodemon can be dropped.

## Layout gotchas

- The server entrypoint is `server/src/index.ts`. An orphaned copy of the old JS server still
  sits at `server/server/src/index.js` (doubled directory name) — it is dead code, delete it.
- Both halves now use `import` syntax, but the **emit targets differ**: `client/package.json`
  is `"type": "module"` (real ESM); `server/package.json` is `"type": "commonjs"` and TS
  compiles its `import`s down to `require`. Server code must stay CJS-compatible — no
  top-level `await`, no ESM-only dependencies.

## Client notes

- React 19 + Vite 8, JSX in `.jsx` files, no TypeScript.
- Entry chain: `index.html` → `src/main.jsx` (mounts `<App />` in `<StrictMode>`) → `src/App.jsx`.
- Styling is plain CSS with nesting, no framework. Design tokens (colors, fonts) are CSS
  custom properties on `:root` in `src/index.css`, including a dark-mode block; component
  styles live in `src/App.css`. Use the existing `var(--…)` tokens rather than hardcoding colors.
- SVG icons are a sprite at `public/icons.svg`, referenced as `<use href="/icons.svg#name-icon">`.
  Raster/logo assets that should be hashed by the bundler go in `src/assets/` and are imported.
- Lint config is `.oxlintrc.json` (`react/rules-of-hooks` as error). Oxlint, not ESLint —
  don't add `.eslintrc`.

## Server notes

- TypeScript 7 + Express 5 (not 4 — error-handling and router behavior differ from most
  Express docs online). `tsconfig.json` is `strict` plus `noUncheckedIndexedAccess` and
  `exactOptionalPropertyTypes`; `module` is `node18` (TS 7 removed `moduleResolution: node`).
- Layout under `src/`: `index.ts` (runs `db/migrate.ts` + `db/seed.ts`, then listen + signal
  handling) → `app.ts` (`createApp()`, the middleware chain) → `routes/` (thin routers, all
  mounted under `/api` by `routes/index.ts`) → `controllers/` (handlers, each exporting its
  own response interface) → `services/` (multi-repository orchestration — only
  `transaction.service.ts` so far; simple controllers call repositories directly, skip a
  service) → `repositories/` (one file per table, or per fixed in-memory data set for
  `shipping-option`/`payment-method`/`cart`) → `db/` (connection, schema, seed data) →
  `models/` (row ↔ API-shape mapping).
- Responses: every success body is `{ success: true, data }`; every error body (built by
  `middleware/error-handler.ts`) is `{ success: false, message }`, plus `details` when the
  thrown `HttpError` carries them and `stack` outside production.
- Errors: throw `HttpError` (`middleware/http-error.ts`, factories for 400/404/409) for
  anything client-facing. `middleware/not-found.ts` and `middleware/error-handler.ts` must
  stay registered last, in that order. Express 5 forwards rejected promises automatically, so
  async handlers need no try/catch.
- Config is centralized in `src/config/env.ts`, which loads `dotenv/config` — read config
  from the exported `env` object, never `process.env` directly. Vars: `PORT` (3000),
  `NODE_ENV` (development), `CORS_ORIGIN` (`*`, or a comma-separated allowlist), `DB_PATH`
  (`data/marketplace.db`, resolved against `process.cwd()` — run npm scripts from `server/`).
  No `.env` file is committed; `server/.gitignore` excludes it.
- Persistence: SQLite via `better-sqlite3` (synchronous API, no async/await needed for
  queries). `db/client.ts` opens the file (WAL mode) and creates `server/data/` if missing;
  `db/migrate.ts` creates tables (`products`, `transactions`, `transaction_items`)
  idempotently; `db/seed.ts` inserts demo product rows only when the table is empty. Both run
  on every boot (`src/index.ts`), so the DB self-heals from a deleted file or fresh clone.
  **Repository gotcha:** prepared statements must be created lazily (inside a function,
  memoized), not at module top level — CommonJS `require()` resolves the whole import chain
  (routes → controllers → repositories) before `index.ts`'s own top-level code runs
  `migrate()`, so a module-scope `db.prepare(...)` executes against tables that don't exist
  yet and throws `SqliteError: no such table`.
- The SQLite file and its WAL sidecars (`data/`, `*.db*`) are gitignored — never committed.
- The cart is a single in-memory `Map` in `cart.repository.ts` (module-level state, not
  SQLite) — one demo user, no auth, resets on restart.
- Checkout (`services/transaction.service.ts`) never trusts the client for price, stock, or
  totals: it re-reads products/shipping-options/payment-methods from the backend, recomputes
  every subtotal and the grand total, and decrements stock — all inside one
  `db.transaction()` alongside the transaction insert, so a failure (bad address/shipping/
  payment, empty cart, missing product, insufficient stock) leaves stock, the transaction
  tables, and the in-memory cart all unchanged. The cart is only cleared after that DB
  transaction commits. Transaction ids are `TRX-YYYYMMDD-NNNN`, sequential per calendar day.
- Routes: `GET /api/health`, `GET /api/hello?name=…`; `GET /api/products` (supports
  `?search=` — exact, case-insensitive match on name, no fuzzy/partial), `GET /api/products/:id`
  (400 on a non-numeric id, 404 if not found); `GET /api/cart`, `DELETE /api/cart`,
  `POST /api/cart/items`, `PATCH|DELETE /api/cart/items/:productId`;
  `GET /api/shipping-options`, `GET /api/payment-methods`; `GET /api/transactions`,
  `POST /api/transactions`, `GET /api/transactions/:id`. Products are demo data only — 10
  rows seeded on first boot, id/name/description/price(IDR)/stock/image.

## Cross-cutting

- The client does not call the server yet. When wiring them up, the choices already implied by
  the code are: CORS is enabled server-side, and `vite.config.js` has **no dev proxy**, so a
  client fetch would go to an absolute `http://localhost:3000/...`. Adding a Vite `server.proxy`
  entry for `/api` and dropping to relative URLs is the alternative — pick one deliberately
  rather than half of each.
