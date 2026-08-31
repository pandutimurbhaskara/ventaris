# CLAUDE.md

## What this is

`ventaris` is a two-part JS project: a React SPA (`client/`) and an Express JSON API (`server/`).
Both halves are still at their generator defaults — the client is the unmodified
`create-vite` React template, and the server is a single `/api/hello` route. There is no
application domain logic yet, no tests, no CI, and **no git repository** (`git init` has not
been run). Treat anything below that reads like a convention as a starting point rather than
an established pattern.

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

`package.json` defines **no `start` or `dev` script** — its `test` script is the npm
placeholder that exits 1, and `main` points at a nonexistent `index.js`. Run it directly:

```
node server/src/index.js              # from inside server/
npx nodemon server/src/index.js       # watch mode; nodemon is a devDependency
```

Adding proper `start`/`dev` scripts and fixing `main` is a reasonable first cleanup if you
are touching `server/package.json` anyway.

## Layout gotchas

- The server entrypoint is at `server/server/src/index.js` — the directory name is doubled.
  Paths in this repo are easy to get wrong because of it; double-check before writing one.
- Client and server use **different module systems**. `client/package.json` is
  `"type": "module"` (ESM, `import`); `server/package.json` is `"type": "commonjs"`
  (`require`). Do not copy import syntax across the boundary.

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

- Express 5 (not 4 — error-handling and router behavior differ from most Express docs online).
- Currently `cors()` is applied wide open and `express.json()` is registered globally.
- `dotenv` is a dependency but is **not required or configured anywhere**, and no `.env` file
  exists. `PORT` is read straight from `process.env` (defaults to 3000). If you introduce
  config, wire up `dotenv` explicitly and add `.env` to a gitignore — `server/` has no
  `.gitignore` at all (only `client/` does).

## Cross-cutting

- The client does not call the server yet. When wiring them up, the choices already implied by
  the code are: CORS is enabled server-side, and `vite.config.js` has **no dev proxy**, so a
  client fetch would go to an absolute `http://localhost:3000/...`. Adding a Vite `server.proxy`
  entry for `/api` and dropping to relative URLs is the alternative — pick one deliberately
  rather than half of each.
