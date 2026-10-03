# Conventions — code, structure and documentation

The rules this repository is written under, enforced by review and, where
possible, by `pnpm lint`, `pnpm typecheck` and the test suite.
[`ARCHITECTURE.md`](ARCHITECTURE.md) explains how the app works; this file says
how its code is shaped. Test rules live in [`TESTING.md`](TESTING.md); the
delivery cycle in [`WORKFLOW.md`](WORKFLOW.md).

---

## 1. The scaffold

```
src/
├── views/       one folder per route destination — the screen's component,
│                its components/ and hooks/, messages, colocated tests
├── features/    independent slices consumed by MORE THAN ONE view. One domain
│                per feature, served from its root <feature>.tsx, growing its
│                own components/ and hooks/ behind one barrel. A flow feature
│                (schedule-import) is the sanctioned exception to the single
│                root: its barrel is the API for the flow's canvases
├── components/  app-wide reusable UI ONLY: ui/ primitives (one folder per
│                component), layout/, shared cards. A slice that fetches is a
│                feature, not a component
├── services/    RTK Query per domain: endpoint builders, DTO→domain mappers,
│                the injected slice; cache-tags is the one home for the tag
│                registry, invalidation groups and builders
├── router/      routes, guards, path builders, URL vocabulary shared across
│                surfaces
├── stores/      Redux slices (client state only) and typed hooks
├── schemas/     Zod form schemas, one per form domain
├── types/       domain types at the root, wire DTOs in dto/ (each header names
│                the backend module it mirrors)
├── hooks/       transversal hooks, folder per hook, behind one barrel
├── utils/       pure logic by responsibility, behind one barrel — no React
├── i18n/        the react-intl provider and locale plumbing
├── constants/   app-wide constants (paths, storage keys, form sentinels)
└── tests/       seed manifest, fixtures, render helpers
```

**The dependency rule.** Views import features and components; **features never
import views**, components never import features or services, and views never
import each other. Anything two views share lives at the altitude of the
sharing — a feature if it fetches or owns domain logic, a `components/`
primitive if it is pure UI, a hook, or `router/` when it is URL vocabulary. What
only one view uses lives under that view.

Enforced by lint: the restricted-path zones in `eslint.config.mjs` block
features→views, components→features and services, hooks→features and views,
cross-view imports, UI in the data layer, and upward imports from leaf modules.
Tests and mocks are exempt. A shared hook _may_ render with `components/ui`
primitives — a hook that builds table columns uses the same ones everything
else does — but imports each from its own folder (`@/components/ui/badge`),
never the `@/components` barrel: components import `@/hooks`, and the two
barrels importing each other is a cycle the bundler splits across chunks.

## 2. Barrels and doors

Every shared layer serves its public API from one root `index.ts`. Three rules:

- **Barrels list every export explicitly** — `export { A, type B } from './x'`,
  never `export *`. The barrel _is_ the curated API: an explicit list is
  reviewable, collisions surface at write time, and dead exports stay visible.
- **A barrel only exports what someone imports.** An entry nobody consumes is
  dead code.
- **`src/views` has no root barrel, on purpose.** The router lazy-loads each
  view; a root barrel would fuse their chunks.

**One door per layer**, enforced by lint: outsiders import the root barrel.
Sanctioned side doors, each for a reason:

- `@/services/<domain>` — the data layer's doors are per-domain, so a lazy view
  never drags the whole layer into its chunk.
- `@/types/dto/<module>` — wire DTOs mirror backend modules and stay deep.
- `@/stores/slices/<slice>` — two slices share action names on purpose, so
  actions cannot live in one barrel; `@/stores/hooks` is the typed-hook door.
- `@/services/api-injector` — only so the store never imports the whole data
  layer.
- Inside a view or a module, own files are referenced **relatively**; the alias
  is for outsiders.

**Sanctioned deep imports.** Nine heavy `components/ui` leaves stay out of the
layer barrel and are imported by their own folder barrel. Re-exporting them
measurably bloats the entry chunk, because module side effects defeat
tree-shaking; everything else enters through `@/components`.

## 3. Code rules

- **One component per `.tsx`.** A named component with its own props and body
  gets its own kebab-case file. Two sanctioned exceptions: `chakra()` styled
  constants stay with the component that uses them, and an inner component plus
  its null-guard wrapper is one component.
- **Every file lives in its own folder with a colocated test.** Exemptions:
  files with nothing to verify — barrels, type-only modules, message catalogs,
  constants.
- **The layout is recursive.** A complex component grows the way a view or a
  feature does: its own `components/` and `hooks/`, its pure domain modules at
  its folder root, and one barrel as its public API. Siblings inside talk
  relatively; outsiders enter through the barrel.
- **Constants are centralized.** No inline literals: storage keys, form
  sentinels and per-module tables each have one home. The same value in two
  files is one constant — unless it is the same value for two _concepts_, which
  stay separate on purpose.
- **Suppressions carry their reason.** A suppression hiding a real defect is a
  bug report, not a comment.
- **Comments say only what the code cannot**, in one or two lines. A third line
  means the comment is narrating; cut it to the rule. A comment restating the
  line under it is deleted, not shortened.
- **No history in code.** No finding codes, phase or session markers, ticket
  ids, author or date; no "used to", "before this", "the bug this closes". State
  the rule that holds now, in the present tense. Contract-version markers are
  allowed: they document the seam, not the process.
- **No commented-out code.**
- **JSDoc on an exported component, hook or DTO documents the contract** — what
  it takes, what it renders or returns, what it can refuse.
- **Naming**: components in PascalCase, in kebab-case files named after them;
  hooks are `use-*`; functions are verbs, values are nouns, booleans read as
  predicates. No `utils.ts` dumping grounds — modules are named by
  responsibility.
- **Every user-facing string goes through react-intl.** Message ids are contract
  with the `lang/*.json` catalogs — renaming one moves its translations with it,
  and a new key lands in all three bundles in the same change.
- **Style with Chakra style props, recipes and semantic tokens.** No class-name
  strings, no ad-hoc styling outside the token system.

## 4. Loading and empty states

**Loading is a property of a component, never a layout of its own.** There is no
loading page and no page-level skeleton: a listing, a table or a shell takes
`isLoading` and draws itself unfinished. A separate loading layout can only
approximate what it stands in front of — that is how a row of three
project-sized cards ended up covering a strip of six KPI tiles.

- **The skeleton is the component.** Same container, same real header, same
  column template, same row height, roughly the same number of rows. Nothing
  moves when the data lands. The `Skeleton` primitive is the placeholder bar and
  the only shared piece — it is ink, not a drawing.
- **The caller passes `isLoading` and stops branching.** A ternary in a view that
  swaps the listing for a placeholder is the old shape; push it into the
  component that knows what it renders.
- **Never text.** No "loading…" line, no bare spinner standing in for content.
- **A state replaces the content, not the surface.** The panel, the padding, the
  heading and the filters stay. An early return that swaps the whole container
  drops the card and makes the page appear to shift when data arrives. The bulk
  toolbar is the one exception; filters are not — a filtered listing with no
  matches needs them to be un-filtered.
- **A skeleton must not answer to the real thing's name.** While the rows are
  bars the container is presentational and busy, carrying no accessible label and
  no content test id. Otherwise a screen reader, and a query by role and name,
  read it as arrived content.
- **First load and refetch are different states.** `isLoading` draws the
  skeleton; `isFetching` over rows already on screen wraps them in the loading
  overlay. Re-showing the full skeleton on every settled search flashes the page;
  showing nothing at all reads as a filter that did nothing.
- **An empty state is a claim, so it waits for an answer.** An unanswered query
  and a genuinely empty result have the same shape; say "no dependencies" only
  once the graph has been read.

**Every empty state is the `EmptyState` primitive** — icon, title, optional
description, optional action. No ad-hoc "no data" line, and no second guard in
front of a component that already owns its empty state: that makes the real one
unreachable and states the same sentence twice. Errors are `ErrorState`, not an
empty state wearing an error message.

## 5. Data layer

- All server state through RTK Query — one `createApi`, per-domain injected
  endpoints, no parallel fetch layer, no server data in Redux slices.
- **Wire DTOs are snake_case and mirror the backend schema exactly.** A field the
  backend does not accept or send does not exist here. Closed backend enums are
  typed as unions on the DTO, so mappers need no casts.
- **Mappers are one-way** (DTO → domain) and live with their service; page
  envelopes go through the one page helper.
- **Invalidation is scoped by project id wherever the id is reachable**, and
  every mutation the backend records in the Historial invalidates that tag.

## 6. Documentation standard

Every `.md` in this repository, wherever it lives, follows these rules.

- **Open with the purpose** in one or two lines: the question the document
  answers and what it does not cover, with a pointer to the document that does.
- **One place per fact.** Information belonging to another document is
  referenced, never copied — including anything owned by
  `lennix-ms-bk/docs/DOMAIN.md`, which is cited by rule id.
- **Density.** Every sentence carries verifiable, actionable information. No
  generic introductions, no restating a heading, no repetition.
- **Verifiable against the current code.** An assertion that cannot be checked
  against this repository does not ship.
- **Present tense, current state.** No decision history, no author or date
  attributions, no "in progress", "to be decided", "WIP". Future work lives in
  `lennix-ms-bk/docs/ROADMAP.md`.
- **Stable identifiers, not section numbers.** Cross-references use document
  names or domain rule ids (`TEN-4`, `IMP-7`). Never `§6.1`, never "see the
  section above".
- **English throughout**, and one language per document — the app's user-facing
  copy is translated; its documentation is not.
- **Consistent structure.** One `#` title, `##` sections, `###` where a section
  genuinely nests. Tables for enumerable facts, prose for rules.

## 7. Maintenance rules

- **A breaking change updates its documentation in the same PR** — a changed
  surface, flow, role scope, layer or build mode lands with
  [`PRODUCT.md`](PRODUCT.md), [`ARCHITECTURE.md`](ARCHITECTURE.md),
  [`CONVENTIONS.md`](CONVENTIONS.md), [`TESTING.md`](TESTING.md) or
  [`WORKFLOW.md`](WORKFLOW.md) as applicable.
- **Adding, removing or re-scoping any document in `docs/` updates
  [`README.md`](README.md) in the same PR.**
- **A permission change is made twice.** The matrix here mirrors the backend's by
  hand; both sides move in the same change, and the parity test is what catches
  a half-landed one.
- **A backend contract change lands here in the same change** — a new DTO field,
  a renamed one, a new closed-enum member — together with a message in all three
  locales for anything a user reads. It lands together; it releases on this
  repository's own cadence.
- **A seed change is re-synced, not hand-patched.** Regenerate the manifest and
  update the fixtures the change affects.
