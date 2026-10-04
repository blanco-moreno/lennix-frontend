# Product — what the app lets people do

The experience `lennix-frontend` delivers: what each role can accomplish, on
which surface, and the rules that make it the product rather than a view of the
API.

It uses the domain vocabulary but never defines it — entities, states and
business rules are canonical in `lennix-ms-bk/docs/DOMAIN.md`, cited here as
`AREA-n`. How any of this is built is [`ARCHITECTURE.md`](ARCHITECTURE.md).

---

## 1. First principles

- **The schedule is the product.** The information architecture makes the live
  schedule the destination, not one tab among equals.
- **The backend is the enforcer; the UI is the explainer.** Permission gates,
  quota limits and blocking rules exist here for clarity, never as the security
  boundary. A permission that exists only in the frontend is a security bug.
- **Transparency by consequence.** Show what a thing means for the user's
  schedule, not what the system did internally. "Every date could move by up to
  11 months" beats "date-format ambiguity detected".
- **Spanish-first.** `es` is the default launch locale and no user-visible
  string is hardcoded — error paths and toasts included.
- **One word per level, and it is not the code's word.** The code and the API
  say phase and subactivity (`TSK-1`); the copy says **Actividad principal** and
  **Subactividad** — `Main activity` / `Subactivity`, `Atividade principal` /
  `Subatividade`. "Fase" appears in no locale. A string true of _both_ levels
  keeps the unqualified _actividad_.

## 2. One home per concept

The golden rule of the information architecture: **no datum is shown two ways in
two places** unless it is an explicit overview → drill-down.

- **One project list.** The dashboard is portfolio _health_, not a second,
  truncated projects page.
- **One drafts home** (Borradores). A draft is not also a dashboard widget with
  its own semantics.
- **One schedule surface.** Activities, dependencies and critical path are
  facets of the same schedule and share one destination.
- **One KPI system.** Hero KPIs are schedule-intelligence signals — delay,
  critical-path slip, at-risk, activation — not generic PM counters duplicated
  between dashboard and project.
- **One approvals home**, where budget and force-start requests both land.
- **One record per project**, called **Historial** and never "Activity": in AEC
  Spanish _actividad_ means task, so "Activity" collides with the domain.
- **One record of what happened, and it is the Historial** (`REC-1`). There is
  no notifications inbox: its vocabulary was a subset of the Historial's. A
  record is _pull_, so the only thing that interrupts a user is a decision
  waiting on them — the sidebar's Approvals entry carries a count of pending
  requests, and nothing else does.
- **One role axis, and it is the system role** (`TEN-2`). `/settings/team`
  shows those four roles and nothing else. Adding a teammate picks no role; a
  role is granted afterwards from that person's own row.

## 3. Getting a schedule in

- **A draft never opens project detail.** It routes to its resumable review
  canvas, always, and one module decides this.
- **Review is resumable** (`PRJ-9`). A user can leave the import half-done and
  come back; the route restores the draft at whatever stage it was left.
- **Drafts never appear in the main projects list** (`PRJ-1`) — Borradores only.
- **Result-first, not wizard-first.** After an upload the user lands on a
  coherent, chronologically ordered schedule and adjusts it. Friction scales
  with how messy the file was: a clean file reaches Activate with near-zero
  required decisions.
- **The review reads as one product.** Schedule, budget and confirm share one
  structure: the draft's identity, one step heading (the stepper only names the
  step), the step's content, the nav. A fact has one owner per step, and the
  same kind of fact uses the same component across steps — the counts and span
  on schedule and confirm, the budget balance on budget and confirm. The unsaved
  count is said once, beside Save. Copy names the thing; there is no narrator.
- **One schedule surface.** The schedule step is one card: the file's facts as
  its header, the open questions as a "to review" band, and under them the
  draft on the same Gantt and selection panel the live schedule uses, so every
  activity, its progress and its dependencies read at a glance. Nothing the
  engine owns is drawn or stated — no status, critical path, delay or block
  (`IMP-10`). Every claim in the header is checkable against the chart.
- **The assumption ledger is by cause, never per cell** (`IMP-5`). A loud cause
  — one with a viable alternative reading — is an item in the band, with that
  alternative plus a one-flip reversal. The quiet ones, the sheet choice and the
  dropped rows sit folded under "how the file was read" in the card's header.
- **Dropped rows are shown, not hidden.** The parse report names what was
  scanned, imported and dropped, with the reason and the source location.
- **The draft is the user's before go-live.** Selecting a row lifts it into the
  panel, from which the user edits it, adds a subactivity under a main
  activity, or deletes it after an in-app confirmation (a soft delete,
  restorable from the papelera); the toolbar adds a main activity. Each action
  is gated on its own permission. A main activity takes a name only — its dates
  and progress derive from its subactivities (`TSK-4`); until go-live it keeps
  the file's progress figure, and the panel says so.
- **The file's progress is correctable.** A subactivity's drawer takes its
  progress across the whole 0–100 range, lowering included: the figure is the
  file's reading, not a report going backwards. Status follows on the server
  (`TSK-9`) and is not shown on the draft.
- **The draft's graph is the user's before go-live.** A row's drawer lists what
  it waits on, each edge badged with where it came from — read from the file or
  added by hand — and lets the user add one with its type and lag in the same
  act, change a type or lag in place, or delete it (`DEP-2`, `DEP-5`). A link
  that would repeat an edge or close a loop is shown disabled, with the reason,
  before it can be picked (`DEP-4`). A predecessor the file named that matched
  no row is a band item and a mark on its row in the chart; the band item and
  the selected row's panel open that row's drawer on the question, answered
  with a type and lag too. Every edge change is saved
  the moment it is made: activation confirms the graph as it stands (`IMP-10`).
- **Relationships the file states but that never became an edge are shown, not
  hidden.** Each quotes the file's own text, its sheet and row, and the reason
  in the user's language; the count is the full one even when the list is
  capped, and they are one item in the band. A link whose file lacks the ID
  column it names says to export the file again with it.
- **A file that did not resolve goes to assisted mapping**, never to a broken
  Gantt.
- **The mirror subactivity is rendered honestly** (`TSK-3`) — a collapsed leaf on
  a live activity, never as invented work. Drafts show childless phases as
  childless, and the selected one says what go-live adds.

## 4. The schedule surface

- **The user owns the graph.** Dependencies are drawn, or arrive parsed from a
  P6 / MS Project export, and are editable in place — relationship type and lag
  included (`DEP-2`). The app never suggests or auto-creates an edge.
- **Broken dependencies are actionable, not decorative.** A "re-link required"
  state leads somewhere; it is not a red badge (`DEP-8`).
- **Blocked, at-risk and force-started are distinct states** and read as such: a
  force-started activity carries permanent at-risk provenance with real
  attribution (`FST-5`).
- **Delay and critical path are always traceable.** Show _why_ — which driving
  dependency — because a number the user cannot check is a number they will not
  trust.
- **The schedule leaves the way it came in.** "Export XLSX" on the schedule
  surface and on the draft review header downloads the schedule in an
  MS Project / P6 friendly layout, named by the backend; a refusal is a
  translated toast, never a code. No AI request is spent on it.

## 5. Governance surfaces

- **Approvals live in one home**, and an approver triages across projects from
  it.
- **Quota failures render as guidance**, not as an error: the backend returns a
  machine-readable refusal saying what was hit; the UI says what to do about it
  (`PLN-3`).
- **The plan is shown as usage, never as a specification.** The Organization
  card in `/settings` meters the four countable resources — projects, drafts,
  seats and AI requests this month — each as its count against its ceiling. No
  ceiling is printed on its own: a number the user cannot place against their
  own usage tells them nothing. Storage is the exception and stays a plain
  entitlement field, because nothing measures it.
- **An unlimited resource is shown, not omitted.** It reads as its count and
  "no limit"; hiding it would leave the user to guess whether the resource is
  unmetered or merely broken.
- **A plan that was negotiated says so.** Overridden limits carry a "custom
  plan" badge beside the plan name, so the numbers on screen are never read as
  the published tier's.
- **One upgrade notice, triggered by usage.** It appears when a resource is at
  its cap or two or more are at 80% of theirs, and it names the next tier —
  every tier has finite ceilings, so the notice promises higher limits, never
  their removal.
- **The risk register stays first-class** — a real 3×3 register (`RSK-2`), not an
  at-risk footnote inside another surface.
- **The project team tab labels the manager; it never edits leadership.** The
  backend states which row it is (`PRJ-8`), so the tab reads it rather than
  matching ids across two responses. That row has no remove control — leadership
  is handed over on the project form.

## 6. Roles: who sees what

Four roles on one axis, two of them organization-wide and two scoped to their
own projects (`TEN-3`, `TEN-4`). This section is the **product scope** of each:
enough to build a screen without reading the permission matrix. How the scope is
_enforced_ is the backend's, and it is written once in
`lennix-ms-bk/docs/DOMAIN.md`.

| Slug      | UI name (es / en / pt-BR)          | In one line                                                                                                                            |
| --------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `owner`   | Propietario / Owner / Proprietário | Founded the organization or received it by transfer; the only one who grants `admin` or hands ownership over                           |
| `admin`   | Admin / Admin / Admin              | Runs the company inside the app: every obra, the roster, the papelera, the settings                                                    |
| `manager` | Gerente / Manager / Gerente        | Runs the obras they belong to: creates them, approves budget and force-start there, seats their team                                   |
| `user`    | Usuario / User / Usuário           | Works on the obras they belong to and **asks** for a budget change or a force start instead of doing it. The default for a new account |

The Spanish `manager` is **Gerente**, not "Jefe de Obra": _jefe de obra_ names a
different thing — the one member who leads a given obra (`PRJ-7`), a per-project
field any role can be named to. One word must not stand for both. The four names
live in `systemRoleMessages` and their one-line scopes in
`systemRoleHelpMessages`, printed under the roster as a legend.

### 6.1 What each role gets

Where a cell says _their obras_, nothing in the UI does the narrowing: the
backend returns fewer rows (`TEN-5`).

| Surface                                                    | `owner` / `admin`                                                    | `manager`                                                       | `user`                                                                                     |
| ---------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `/dashboard`                                               | The organization's portfolio health                                  | The same screen over **their obras**, and the lead line says so | **No access** — nav entry hidden, route answers the refusal page, which offers `/projects` |
| `/projects`, `/tasks`                                      | Every obra and activity                                              | Theirs                                                          | Theirs                                                                                     |
| New project and import                                     | Yes                                                                  | Yes                                                             | No — button hidden, routes gated, the nav group hidden                                     |
| `/approvals`                                               | Both sections, decide                                                | Both sections, decide, on their obras                           | The same home, **read-only**: their own requests, with "mine" wording                      |
| `/settings` (account)                                      | Yes                                                                  | Yes                                                             | Yes                                                                                        |
| `/settings` → organization                                 | Yes                                                                  | Hidden                                                          | Hidden                                                                                     |
| Transfer ownership                                         | Owner only, matched on the organization's owner, not on a matrix key | No                                                              | No                                                                                         |
| `/settings/team`                                           | Yes: roster, invite, grant a role                                    | No                                                              | No                                                                                         |
| `/trash`                                                   | View, restore, purge                                                 | No                                                              | No                                                                                         |
| Project detail — tabs                                      | All                                                                  | All, on their obras                                             | All, on their obras                                                                        |
| Project detail — edit, priority, dependencies, risks       | Yes                                                                  | Yes                                                             | Yes, on their obras                                                                        |
| Project detail — delete / archive                          | Yes                                                                  | No                                                              | No                                                                                         |
| Project detail — team panel, manager field                 | Yes                                                                  | Yes                                                             | No                                                                                         |
| Project detail — expenses (create, filter by layer)        | Yes                                                                  | Yes                                                             | Yes, on their obras                                                                        |
| Activity detail — create, edit, delete, progress, expenses | Yes                                                                  | Yes                                                             | Yes, on their obras                                                                        |

Five consequences a screen built from the permission matrix alone gets wrong:

- **Deleting is paired with the papelera.** Whoever deletes an obra must be able
  to restore it, so deletion stops where the trash surface stops:
  organization-wide roles only. In Borradores this splits the surface — a
  `manager` reaches the drafts home and imports there, but the bulk discard, and
  with it the whole row selection, is hidden for them.
- **Seating somebody on an obra is not hiring them** (`TEN-14`). A `manager` adds
  an existing colleague to their obra; bringing a new person into the company is
  `/settings/team`, which they do not have.
- **The home after signing in is a decision, not a constant.** `/` resolves to
  `/dashboard` for whoever holds the dashboard permission and to `/projects` for
  a `user`, behind the auth guard so the role has already resolved. A `user`
  must never meet the refusal page as their first screen.
- **The responsable and jefe-de-obra pickers are not the roster, and not the
  same set either.** Both read the project's assignable members, which answers
  the wide set — naming a jefe de obra seats whoever is named — and each row
  carries the narrower flag a work assignee must pass (`TSK-12`). Anyone offered
  who is not on the team is badged with their role.
- **Deleting your own account is offered only to `owner` and `admin`.** A
  `manager` or `user` belongs to somebody else's organization; their account is
  removed from `/settings/team`. The owner still sees the card, which names the
  fork the backend enforces — transfer, or destroy the organization with the
  account (`TEN-10`).

### 6.2 Which action replaces which

**A `user` is never shown a dead control.** Every action they cannot take is
replaced, in place, by the request that leads to it.

| Where                             | `owner` / `admin` / `manager`                                      | `user`                                                                                |
| --------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Project edit drawer, budget field | Types the new amount and saves — a direct edit                     | The same field plus a **required reason**: saving files a budget-approval request     |
| Activity detail, actions menu     | No separate budget item — the amount is a field of the edit drawer | A distinct **request budget change** action                                           |
| A blocked activity                | **Forces the start outright**                                      | **Requests the force start** with a justification; only the approval force-starts it  |
| `/approvals`                      | Decides                                                            | Watches their own requests; the sidebar count is theirs, not the organization's queue |

Nobody holds both the direct key and the request key for the same action, so
self-approval cannot arise (`BUD-6`). The split is the backend's; the UI follows
it.

## 7. Quality the user can feel

- **Quota and permission failures explain themselves** rather than surfacing a
  raw error.
- **Errors degrade one route**, never the whole app.
- **One refresh at a time.** A burst of expired-token responses triggers exactly
  one refresh; everything else waits and retries, so a session is never dropped
  mid-use.
- **Nothing moves when data lands.** Loading is drawn by the component that
  knows what it renders, in the shape of the real thing.
