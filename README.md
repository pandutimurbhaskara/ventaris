# Ventaris

A small e-commerce demo built as two independent npm packages:

| Package | Stack | Role |
| --- | --- | --- |
| [`client/`](client) | React 19 · Vite 8 · Tailwind 4 · React Router 7 | Storefront SPA (plain JS/JSX) |
| [`server/`](server) | Express 5 · TypeScript (strict) · better-sqlite3 | JSON API over SQLite |

Browse products → add to cart → check out with a shipping option and payment
method → review past transactions.

> **Demo-grade, by design.** There is no authentication, and the cart is a
> process-global `Map` shared by every caller (`server/src/repositories/cart.repository.ts`).
> Restarting the server empties it. Products and transactions do persist, in SQLite.

---

## Quick start

Requires **Node.js 24** (the version CI runs; `better-sqlite3` installs from a prebuilt
binary, so no compiler toolchain is needed).

The two packages have separate lockfiles and no workspace root — install each one:

```bash
# terminal 1 — API on http://localhost:3000
cd server && npm install && npm run dev

# terminal 2 — SPA on http://localhost:5173
cd client && npm install && npm run dev
```

Open <http://localhost:5173>. On first boot the server creates its SQLite file,
runs migrations, and seeds ten demo products — no manual DB setup.

The client calls the API at the **relative** path `/api`, and `client/vite.config.js`
proxies `/api` → `http://localhost:3000` in dev. Nothing hardcodes a backend host,
so a production build only needs whatever serves it to route `/api` to the API.

---

## Scripts

Both packages:

| Script | Client | Server |
| --- | --- | --- |
| `npm run dev` | Vite dev server + HMR | `tsx watch` |
| `npm run build` | `vite build` → `client/dist/` | `tsc` → `server/dist/` |
| `npm run lint` | oxlint | oxlint |
| `npm test` | Jest | `node:test` |
| `npm run typecheck` | — (no TypeScript) | `tsc --noEmit` |
| `npm start` | — (use `npm run preview`) | `node dist/index.js` |

Client also has `test:watch`, `test:coverage`, and `preview` (serves the built `dist/`).

Running a single test:

```bash
cd client && npx jest src/utils/format.test.js        # one file
cd client && npx jest -t "formats zero"              # one test by name

cd server && npx tsx --test src/services/transaction.service.test.ts
```

---

## Server

Express 5 — note that its error handling and router behaviour differ from the Express 4
examples most search results return. Async handlers need no `try/catch`; Express 5 forwards
rejected promises to the error middleware on its own.

### Layout

```
src/
  index.ts          boot: migrate() → seed() → listen, with SIGINT/SIGTERM shutdown
  app.ts            createApp(): cors → json → /api router → notFound → errorHandler
  config/env.ts     env parsing; the single source of PORT / CORS_ORIGIN / DB_PATH
  routes/           thin routers, one per resource, mounted under /api
  controllers/      request/response shaping
  services/         business rules (checkout lives here)
  repositories/     all SQL
  models/           domain types
  middleware/       HttpError, error-handler, not-found
  db/               client (better-sqlite3), migrate, seed
```

The dependency direction is one-way: `routes → controllers → services → repositories → db`.
Repositories are the only layer that writes SQL — though two of them,
`shipping-option.repository.ts` and `payment-method.repository.ts`, are hardcoded
enumerations with no table behind them. Don't go looking for the schema.

`createApp()` is exported separately from `index.ts`, so an app can be constructed without
binding a port.

### Endpoints

All are prefixed with `/api`.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | liveness probe |
| `GET` | `/hello` | trivial smoke endpoint |
| `GET` | `/products` | list products |
| `GET` | `/products/:id` | one product |
| `GET` | `/cart` | current cart |
| `POST` | `/cart/items` | add an item |
| `PATCH` | `/cart/items/:productId` | change quantity |
| `DELETE` | `/cart/items/:productId` | remove an item |
| `DELETE` | `/cart` | empty the cart |
| `GET` | `/shipping-options` | selectable shipping tiers |
| `GET` | `/payment-methods` | selectable payment methods |
| `GET` | `/transactions` | list orders |
| `POST` | `/transactions` | check out |
| `GET` | `/transactions/:id` | one order |

### Response envelope

Success is always `{ "success": true, "data": ... }`; the client's `http.js` unwraps
`.data`, so handlers never return a bare array or object.

Failure is `{ "success": false, "message": ... }`, plus `details` when the thrown
`HttpError` carries them, plus `stack` outside production. Throw `HttpError.badRequest(...)`
/ `.conflict(...)` rather than calling `res.status(...)` in a controller.

### Checkout rules

`POST /api/transactions` (`services/transaction.service.ts`) validates the payment method,
then rejects the whole order with **409** if any line exceeds available stock. On success it
writes the transaction, decrements product stock, and clears the cart — the write is wrapped
in a single SQLite transaction, so a mid-flight failure leaves no partial order. New orders
start at status `PROCESSING` with payment `PENDING`.

### Data

SQLite via `better-sqlite3` (synchronous — no `await` on queries). `migrate()` and `seed()`
are both idempotent and run on every boot; seeding is skipped once `products` is non-empty.

Tables: `products`, `transactions`, `transaction_items`. Money is stored in **integer minor
units**, never floats.

### Configuration

Read only through `config/env.ts`, which is loaded once at module load.

| Variable | Default | Notes |
| --- | --- | --- |
| `PORT` | `3000` | must be a positive integer, else boot fails |
| `CORS_ORIGIN` | `*` | comma-separated allowlist, or `*` for any |
| `DB_PATH` | `data/marketplace.db` | relative paths resolve against `server/` |
| `NODE_ENV` | `development` | `production` hides stack traces and 500 detail |

`dotenv/config` is imported, so a `server/.env` is picked up automatically. The
`data/` directory and `.env` are gitignored.

---

## Client

Plain JavaScript and JSX — there is **no TypeScript here**, and no `tsconfig.json`. The
`@types/react` packages are only present for editor hints.

### Layout

```
src/
  main.jsx        router + CartProvider mount
  App.jsx         shell: Header + <Outlet />
  pages/          one component per route
  components/     reusable presentational pieces
  context/        CartContext — cart state shared across pages
  api/            one module per resource, all on top of http.js
  utils/          formatting helpers
  test/           Jest setup and a CSS module stub
```

### Routes

| Path | Page |
| --- | --- |
| `/` | HomePage — product grid |
| `/products/:id` | ProductDetailPage |
| `/cart` | CartPage |
| `/checkout` | CheckoutPage |
| `/transactions` | TransactionsPage |
| `/transactions/:id` | TransactionDetailPage |
| `*` | NotFoundPage |

### API layer

Every call goes through `src/api/http.js`, which prefixes `/api`, sets the JSON content
type, unwraps the `data` envelope, and throws `ApiError` (carrying `status` and `details`)
on a non-2xx. Add new calls to the matching `src/api/*.js` module rather than calling
`fetch` from a component.

### Styling

Tailwind CSS 4 through the `@tailwindcss/vite` plugin — configured in `src/index.css`,
with no `tailwind.config.js`.

### Testing

Jest + React Testing Library in a jsdom environment, compiled by Babel (not Vite), so
`babel.config.cjs` and `jest.config.cjs` govern tests while `vite.config.js` governs the
app. A dependency that only works under Vite's transform pipeline will not automatically
work in tests.

---

## CI

`.github/workflows/ci.yml` runs on every push, every pull request, and on manual dispatch.
A newer push to the same ref cancels the older run.

Two jobs run in parallel, one per package, each with its own npm cache:

| Step | `client` job | `server` job |
| --- | --- | --- |
| Install | `npm ci` | `npm ci` |
| Lint | oxlint | oxlint |
| Typecheck | — | `tsc --noEmit` (strict) |
| Unit tests | Jest | `node:test` |
| Build | `vite build` | `tsc` |

A third job, **`ci`**, gates on both and is the check to point branch protection at — that
way adding a future job does not mean editing the protected-branch rule.

Note that lint **warnings do not fail the build**; oxlint currently reports a handful on the
client. Add `--max-warnings=0` to the client `lint` script once those are cleared.

### Running CI locally

```bash
cd server && npm ci && npm run lint && npm run typecheck && npm test && npm run build
cd client && npm ci && npm run lint && npm test && npm run build
```

### Known issue: serialized server tests

The server `test` script pins `--test-concurrency=1`. This is a mitigation, not a fix.

Two test files touch the database: `product.repository.test.ts` and
`transaction.service.test.ts`. Both open with a `process.env.DB_PATH = <tmp file>` assignment
above their imports, commented "Must run before any import" — intending to redirect
`db/client.ts`, which opens SQLite at module load.

**That redirect never takes effect.** `tsx` compiles via esbuild, which hoists every
`require()` above ordinary statements when it emits CommonJS — so `db/client.ts` loads, and
resolves `DB_PATH`, before the assignment runs. Neither file gets a throwaway database; both
open the real `data/marketplace.db`, and `node:test` runs them in parallel processes. The
result is intermittent `SQLITE_BUSY: database is locked` — roughly 2 failures in 8 runs
before serialization. (You can see it directly: run the suite and no temp DB is ever
created, while `data/marketplace.db` is.)

The proper fix is to stop relying on import order — read `DB_PATH` lazily inside
`db/client.ts` instead of at module load, or have the tests set it from a separate module
imported first. Then drop `--test-concurrency=1` and get the parallelism back.

---

## Repository notes

- **`server/node_modules` is committed** — about 930 stale files, tracked before
  `server/.gitignore` existed. `.gitignore` does not untrack, so clearing it needs
  `git rm -r --cached server/node_modules`.
- **`server/server/src/index.js`** is a leftover from the pre-TypeScript version. The live
  entrypoint is `server/src/index.ts`; the doubled path is dead code.
- `client/README.md` is still the stock `create-vite` template text.
