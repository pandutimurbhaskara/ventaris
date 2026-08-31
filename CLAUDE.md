# CLAUDE.md

## What this is

`ventaris` is a two-part project: a React SPA (`client/`, JavaScript) and an Express JSON API
(`server/`, TypeScript). The client is still the unmodified `create-vite` React template. The
server has a layered structure (routes → controllers, shared middleware and config) but no
application domain logic yet — only `/api/health` and `/api/hello`. There are no tests and no
CI. Treat anything below that reads like a convention as a starting point rather than an
established pattern.

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
- Styling is **Tailwind CSS v4** via the `@tailwindcss/vite` plugin (no `tailwind.config.js`
  and no PostCSS — v4 is configured in CSS). `src/index.css` is the whole stylesheet:
  `@import 'tailwindcss'`, design tokens in `@theme`, global base rules in `@layer base`,
  and the dark-mode token overrides. There is no `App.css`; component styling is utility
  classes in the JSX, with repeated class strings hoisted to consts at the top of `App.jsx`.
- Colors and fonts are `@theme` tokens (`--color-text-h`, `--color-border`, `--font-heading`, …),
  so each generates utilities (`text-text-h`, `border-border`, `font-heading`). Use those
  utilities rather than hardcoding colors. Dark mode is a plain
  `@media (prefers-color-scheme: dark)` block that reassigns the same token variables — it sits
  **outside** any `@layer` so it beats the `@theme` defaults. Add new colors there in both places.
- Two things to know before editing styles:
  - `:root` deliberately has **no `font-size`**. It stays at the browser default 16px so
    Tailwind's rem scale maps 1:1 to px (`p-8` = 32px, `text-base` = 16px). Body text size
    (16px, 18px at `lg`) is set on `body` in px. Don't move it back to `:root`.
  - Preflight blockifies `img`/`svg` and sets `vertical-align: middle`. A few elements
    (`sectionIcon`, the hero base image) carry `inline align-baseline` to keep the original
    inline-layout spacing; the comments in `App.jsx` say so.
- The mobile breakpoint is Tailwind's `lg` (1024px), mobile-first: base styles are the small
  screen, `lg:` is desktop. The old CSS used `@media (max-width: 1024px)` instead.
- SVG icons are a sprite at `public/icons.svg`, referenced as `<use href="/icons.svg#name-icon">`.
  Raster/logo assets that should be hashed by the bundler go in `src/assets/` and are imported.
- Lint config is `.oxlintrc.json` (`react/rules-of-hooks` as error). Oxlint, not ESLint —
  don't add `.eslintrc`.

## Server notes

- TypeScript 7 + Express 5 (not 4 — error-handling and router behavior differ from most
  Express docs online). `tsconfig.json` is `strict` plus `noUncheckedIndexedAccess` and
  `exactOptionalPropertyTypes`; `module` is `node18` (TS 7 removed `moduleResolution: node`).
- Layout under `src/`: `index.ts` (listen + signal handling) → `app.ts` (`createApp()`, the
  middleware chain) → `routes/` (thin routers, all mounted under `/api` by `routes/index.ts`)
  → `controllers/` (handlers, each exporting its own response interface).
- Errors: throw `HttpError` (`middleware/http-error.ts`) for anything client-facing.
  `middleware/not-found.ts` and `middleware/error-handler.ts` must stay registered last, in
  that order. Express 5 forwards rejected promises automatically, so async handlers need no
  try/catch. Stack traces are included in error bodies outside production only.
- Config is centralized in `src/config/env.ts`, which loads `dotenv/config` — read config
  from the exported `env` object, never `process.env` directly. Vars: `PORT` (3000),
  `NODE_ENV` (development), `CORS_ORIGIN` (`*`, or a comma-separated allowlist). No
  `.env` file is committed; `server/.gitignore` excludes it.
- Routes: `GET /api/health`, `GET /api/hello?name=…`.

## Cross-cutting

- The client does not call the server yet. When wiring them up, the choices already implied by
  the code are: CORS is enabled server-side, and `vite.config.js` has **no dev proxy**, so a
  client fetch would go to an absolute `http://localhost:3000/...`. Adding a Vite `server.proxy`
  entry for `/api` and dropping to relative URLs is the alternative — pick one deliberately
  rather than half of each.
