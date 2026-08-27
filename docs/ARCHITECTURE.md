# Architecture — how the app is built

The structure of `lennix-frontend`: the stack, the layout, the data layer,
routing, permissions, i18n, the two surfaces that carry the product, and how it
is built and deployed.

What this does **not** cover: what the UI must guarantee
([`PRODUCT.md`](PRODUCT.md)), how the code is shaped
([`CONVENTIONS.md`](CONVENTIONS.md)), or the business rules it renders
(`lennix-ms-bk/docs/DOMAIN.md`).

---

## 1. Stack

| Concern            | Choice                                                                      |
| ------------------ | --------------------------------------------------------------------------- |
| Language and build | TypeScript 5.9 in strict mode, Vite 7 with the SWC React plugin             |
| UI                 | React 19, Chakra UI v3 — tokens, semantic tokens and recipes                |
| Server state       | Redux Toolkit with RTK Query                                                |
| Client state       | Redux Toolkit slices (auth session, locale)                                 |
| Routing            | React Router v7, lazy-loaded routes                                         |
| Forms              | React Hook Form with Zod resolvers                                          |
| Tables             | TanStack React Table                                                        |
| i18n               | react-intl, bundles in `lang/{en,es,pt-BR}.json`                            |
| Tests              | Vitest with Testing Library and MSW; Playwright with playwright-bdd for e2e |
| Tooling            | pnpm, ESLint v9 flat config, Prettier, Husky with lint-staged               |
| Hosting            | Vercel                                                                      |

The app talks **only** to `lennix-ms-bk`. It never calls the AI service and
never touches cloud storage.

## 2. Layout

```
src/
├── views/          one folder per route destination — the screen, its components/ and hooks/, colocated tests
├── features/       independent slices consumed by more than one view, one domain each
├── services/       RTK Query, one folder per backend domain
├── stores/         Redux store, slices, typed hooks
├── hooks/          transversal hooks (permissions, KPIs, pending count, debounce, pagination)
├── router/         routes, guards, path builders, per-route error boundaries
├── i18n/           the react-intl provider, locale plumbing, imperative translate
├── types/          domain types at the root, wire DTOs in dto/
├── theme/          the Chakra v3 system: tokens, semantic tokens, recipes
├── schemas/        Zod form schemas, one per form domain
├── utils/          pure logic by responsibility — no React, no JSX
├── constants/      paths, storage keys, form sentinels
├── components/     app-wide reusable UI only: ui/ primitives, layout/, shared cards
├── mocks/          MSW handlers — the test and e2e HTTP layer
└── tests/          seed manifest, fixtures, render helpers
```

The dependency rule between these layers, and the lint zones that enforce it,
are in [`CONVENTIONS.md`](CONVENTIONS.md).

## 3. Data flow

All server state goes through RTK Query. There is no parallel fetching layer and
no server data in Redux slices — two copies of server state is how the two get
to disagree.

`services/api-injector.ts` is the single `createApi` instance; each domain
injects its endpoints into it, so there is one cache, one tag registry and one
base query. That base query adds three things on top of `fetchBaseQuery`:

1. **A guaranteed `message` on every error**, derived from the backend's
   response, so any caller can surface it without a helper.
2. **A refresh mutex.** An expired token triggers exactly **one** refresh; every
   other in-flight request waits on it and retries. Without the mutex a burst of
   parallel 401s produced a refresh storm that could log the user out mid-session.
3. **Localized error toasts** through the imperative translate — no hardcoded
   English on any error path.

**Cache invalidation is scoped, never whole-type.** Invalidating an entire tag
type on every mutation caused refetch storms across unrelated surfaces;
mutations invalidate the specific ids they touched.

Wire DTOs mirror the backend's schema exactly and are mapped one-way into domain
types beside their service, so a backend rename does not leak through the app.

## 4. Routing

`src/router/` holds routes, guards, path builders and error boundaries.

- **Per-route error boundaries.** A thrown render error degrades one
  destination, not the whole app into an unstyled root boundary. Messages are
  localized.
- **Guards mirror backend permissions.** A deep link into a route the user
  cannot use is blocked in the UI _and_ by the backend — the guard is UX, never
  the security boundary.
- **One module decides where a project opens.** A draft routes to its resumable
  review canvas; a live project routes to project detail. Sending a draft to
  project detail is the bug that made imports look broken.
- **List and detail are separate routed views**, pinned by a test, rather than
  one component branching on a parameter.
- **Filtered lists keep filters, sort and page in the URL**, not in a slice, so a
  view is shareable and restorable.

## 5. Permissions

`src/utils/permissions/matrix.ts` mirrors the backend's permission keys — the
same strings the API enforces, not a parallel vocabulary — over the four role
slugs, resolved from the profile. `use-permission` and `require-permission` gate
the UI.

The matrix answers **what** a role may do. **Where** is the server's second gate
and nothing here mirrors it: a scoped role simply receives fewer rows (`TEN-4`,
`TEN-5`). When the backend elevates a user — founding an organization makes them
its owner — the auth sync refetches the profile so gated UI unlocks without a
full reload.

The mirror is hand-written and kept in parity by a test. **A change to either
side is incomplete until both carry it**: a frontend-only grant shows a control
that 403s, a frontend-only revocation hides a control the API happily serves.

## 6. Internationalization

react-intl everywhere: **no user-visible string is hardcoded**, error paths and
toasts included. `es` is the default launch locale and its bundle is complete;
an imperative `translate` serves non-component contexts such as the base query.
A missing key fails loudly in tests rather than rendering an id.

## 7. The import surface

`src/features/schedule-import/`. The draft review route is a four-step wizard in
two columns: the project's identity on top, a vertical stepper on the left, the
active step's surface on the right — `upload → schedule → budget → confirm`.

**One draft, one Save.** The header edits the project's identity and the budget
step edits its money, but they are one draft of one project: a single hook owns
both, and "save and continue later" is the only write. A step with a Save of its
own meant the button whose name promises a save could walk away from what the
step above it was holding.

**Where the step lives.** The URL owns it, like every other navigable state
here; the backend's saved step is the _memory_ behind it, so a review resumes on
another device. Precedence is **URL > saved step > derived from state**, with a
clamp over all three: a step the draft's real state cannot support is refused
whoever asked for it (`PRJ-9`). The derived fallback is where the work starts,
not how far the draft may go.

`allocated` from the task-budget response is never rendered: it counts live
tasks, so it is zero for a draft's whole life (`BUD-4`). The budget step sums the
split client-side.

| Folder                 | Role                                                                  |
| ---------------------- | --------------------------------------------------------------------- |
| `schedule-canvas/`     | The result-first canvas the user lands on                             |
| `narration-receipt/`   | The checkable receipt of what the parse did                           |
| `review-tray/`         | The one review mechanism, where rows get resolved                     |
| `assumption-ledger/`   | Assumptions by cause, with the alternative and a one-flip reversal    |
| `inline-row-edit/`     | Editing rows in place, with edit-pinning so the touched row stays put |
| `draft-review-canvas/` | The wizard shell over the resumable review state                      |
| `draft-header/`        | The project's identity above every step                               |
| `wizard-nav/`          | Back, Next, Activate and Save in the stepper's sticky column          |
| `confirm-summary/`     | Everything go-live will record, in one read                           |
| `import-stepper/`      | The one stepper: vertical, four stations, navigates but never stores  |
| `upload-summary/`      | What the upload actually read                                         |
| `budget-step/`         | The budget split per main activity                                    |
| `schedule-preview/`    | The read-only Gantt, fed from the review state so the edges show      |
| `trust-copy/`          | Contract facts into sentences in the user's language                  |

**No word a user reads comes from the contract** (`IMP-6`). The AI service ships
the _facts_ behind every trust output — a cause, a scope, a chosen token, a
count, all closed enums — and never the sentence. `trust-copy/` is the only place
a token becomes prose, through react-intl. The contract's English prose fields
are for debugging and **must not be rendered**. Adding an enum member upstream is
a contract change and needs a message here in the same release; the backend
refuses a payload carrying one it does not know, so the gap fails at the seam
rather than on screen.

The surface polls the backend's import job and resolves each terminal state to a
destination: the review canvas, the assisted-mapping view, or an honest failure
(`IMP-7`).

Go-live is the **one commit** on this path, so the project's own fields ride
along with it instead of saving separately. Absence is meaningful there — the
backend applies each optional field only when it arrives — so only the fields the
user actually changed are put in the body.

## 8. The schedule surface

`src/views/project-detail-view/components/project-schedule/` — the Gantt with
critical path and propagated delay, dependency building in place with
relationship type and lag, broken-dependency re-linking, and parent
auto-complete. It is **one** surface: activities, dependencies and critical path
were three views of the same schedule.

The chart mounts only the rows in its scrollport once a schedule passes
`WINDOW_MIN_ROWS` (`features/schedule-gantt/gantt-geometry.ts`): every row's
`y` comes from its index in the full row list, so a windowed row sits where the
full chart put it, and the scroll height stays the whole schedule's. Below the
threshold every row is mounted.

## 9. Observability

`src/rum.ts`: the five web vitals with the library's rating, plus `error` and
`unhandledrejection` with the error's class, batched and sent with
`navigator.sendBeacon` as `text/plain` — it survives unload and avoids a CORS
preflight. The queue flushes when the page hides or reaches the backend's cap.
`VITE_RUM_ENDPOINT` unset sends to the backend's `/v1/rum/vitals`; empty
registers no listener at all; a URL sends there. The e2e build never starts it.
Failures to report are swallowed, and a payload carries no token and no identity.

## 10. Build modes and deployment

| Command          | Mode        | Purpose                                             |
| ---------------- | ----------- | --------------------------------------------------- |
| `pnpm dev`       | development | Dev server on port 3000 against a running backend   |
| `pnpm build`     | production  | The bundle Vercel serves, with sourcemaps           |
| `pnpm build:e2e` | e2e         | The same bundle with the MSW browser worker started |

`VITE_API_BASE_URL` points the app at a backend, and `VITE_RUM_ENDPOINT`
redirects or disables the RUM beacon ("Observability"). The MSW worker starts
only when `VITE_E2E_MOCKS` is set, which only the e2e env file sets and only the
e2e build reads — Vite folds the branch away, so no build a user can reach
contains MSW.

Deployment is Vercel from `main`. Node is pinned by Volta and pnpm is the only
supported package manager.
