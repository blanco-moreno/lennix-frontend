# AGENTS.md — lennix-frontend

Instructions for coding agents working in this repository. This file is the
single source of truth for agents; it points at the documentation rather than
restating it.

## 1. Before any task

Read [`docs/README.md`](docs/README.md) first — it is the routing table for the
documentation — then open **only** the documents relevant to the task.

The usual mapping: what a user can do on a surface → `docs/PRODUCT.md`; how the
app is built → `docs/ARCHITECTURE.md`; how to write the code →
`docs/CONVENTIONS.md`; how to verify it → `docs/TESTING.md`; how to ship it →
`docs/WORKFLOW.md`.

**The domain is defined in `lennix-ms-bk/docs/DOMAIN.md`** — entities, states,
transitions and business rules are canonical there, cited by rule id (`TEN-4`,
`IMP-7`). This app renders that domain and enforces none of it. Do not restate a
domain rule here; cite it.

## 2. Working rules

- **Never commit to `main`.** Branch first; the full cycle is
  [`docs/WORKFLOW.md`](docs/WORKFLOW.md) and it is mandatory.
- **The quality gate is `pnpm typecheck` → `pnpm lint` → `pnpm test` →
  `pnpm e2e`**, all green locally before a PR.
- **The backend is the enforcer.** A permission gate here is UX; a permission
  that exists only in the frontend is a security bug, and so is a screen that
  narrows rows client-side instead of receiving fewer of them.
- **Every user-facing string goes through react-intl**, error paths and toasts
  included, with the key in all three bundles in the same change.
- **Every new file lives in its own folder with a colocated test.**
- **Respect the dependency rule**: features never import views, components never
  import features or services, views never import each other. Lint enforces it.
- **Import through the root barrel**, and never `export *` from one.
- **Test data comes from the seed manifest** — never a hand-written payload,
  never a hard-coded UUID.
- **Cache invalidation is scoped**, never whole-type.
- **Style with Chakra tokens and recipes**; no ad-hoc styling outside the system.
- Full rules: [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md).

## 3. Documentation is part of the change

- **A breaking change updates its documentation in the same PR** — a changed
  surface, flow, role scope, layer or build mode lands with the affected `docs/`
  files.
- **Adding, removing or re-scoping any document in `docs/` updates
  `docs/README.md` in the same PR.**
- **A permission change is made twice**: the matrix here mirrors the backend's by
  hand, and both sides move in the same change.
- **A backend contract change lands here in the same change**, with translations
  for anything a user reads. Repositories land together; each releases itself.
- All documentation follows the documentation standard in
  [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md).

## 4. Commands

```bash
pnpm install
pnpm dev             # dev server on :3000 against a running backend
pnpm build           # production bundle
pnpm serve           # serve the production bundle locally

pnpm typecheck       # tsc --noEmit
pnpm lint            # eslint src
pnpm lint:fix        # eslint --fix
pnpm test            # vitest --run
pnpm test:coverage   # with the 80% repo-wide floor — what CI runs
pnpm e2e             # bddgen + playwright against a production build

pnpm seed:sync       # regenerate the seed manifest from the backend
pnpm seed:check      # fail if it is stale
```

pnpm is the only supported package manager and Node is pinned by Volta.
`VITE_API_BASE_URL` points the app at a backend. `pnpm test` ignores a path
argument and always runs the whole suite.

`pnpm seed:sync` reads the sibling backend checkout, or `LENNIX_MS_BK_PATH` —
point it at a clean one when the sibling is dirty.
