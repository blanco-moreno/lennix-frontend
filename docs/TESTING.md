# Testing — how features are verified

What a test is in this repository, where its data comes from, how to write one,
and what the end-to-end suite covers — including how to write a scenario. Code
rules live in [`CONVENTIONS.md`](CONVENTIONS.md); the delivery cycle the suites
gate lives in [`WORKFLOW.md`](WORKFLOW.md).

---

## 1. Running the suites

```bash
pnpm test            # vitest --run, no coverage — the fast loop
pnpm test:watch      # watch mode
pnpm test:coverage   # enforces the floor — what CI runs
pnpm e2e             # bddgen + playwright against a production build
pnpm e2e:report      # open the last HTML report
pnpm exec playwright test --ui   # pick and watch scenarios

pnpm seed:sync       # regenerate the seed manifest from the backend
pnpm seed:check      # fail if the checked-in manifest is stale
```

`pnpm test` ignores a path argument and always runs the whole suite; narrow with
Vitest's own filters instead.

## 2. Demo data comes from the seed, never from your head

The backend ships a canonical demo dataset (`lennix-ms-bk/app/seeds/`) — the
organization, its users and roles, live projects and drafts, activities,
dependencies, expenses, the project record, and the force-start and
broken-dependency scenarios. That is what a seeded Lennix actually serves, so it
is what tests assert against.

Three layers, in order:

| Layer    | Path                  | What it is                                                                                     |
| -------- | --------------------- | ---------------------------------------------------------------------------------------------- |
| Manifest | `src/tests/seed/`     | A **generated** mirror of the backend seed — stable ids and entity facts. Never edited by hand |
| Fixtures | `src/tests/fixtures/` | The manifest turned into API DTOs                                                              |
| MSW      | `src/mocks/handlers/` | The HTTP layer. Handlers only route; every response body is a fixture                          |

Four rules:

- **Never hand-write a demo payload** in a test or a handler. Extend a fixture
  instead — one source of truth, so a seed change lands everywhere.
- **Never hard-code a UUID.** Use the manifest's ids; their names mirror the
  backend's constants, so a rename breaks the build instead of drifting.
- **A value the seed does not have** — a filename, a timestamp — goes in the
  fixture as a clearly named fixture constant, so it reads as a test concern
  rather than a seed fact.
- **A shape the backend does not serve does not get invented.** It lands with
  the change that builds the contract.

**Keeping the manifest honest.** `seed-sync.test.ts` gates it in two layers:
always, that the manifest is internally consistent and every fixture resolves
through it; and, when the backend is checked out beside this repository, that
regenerating it produces the same bytes. When it fails, run `pnpm seed:sync`,
read the diff, and update the fixtures the change affects — never edit the
generated file. Point `LENNIX_MS_BK_PATH` at a clean backend checkout when the
sibling is not next door.

## 3. What a test is

A test verifies **what a user sees** through a rendered surface. Four principles
measure a new one:

1. **Behaviour over implementation.** Never internal state, never a class name,
   never a tag name, never "the prop did not leak onto the DOM node". A test
   that only proves Chakra rendered something is testing Chakra.
2. **Zero redundancy.** If a page or container test exercises the flow, an
   isolated test of one of its children re-asserting the same thing is deleted.
   Two tests that fail for the same reason cost twice and protect once.
3. **Efficient coverage.** The critical path first. Edge cases earn their place
   for real logic, a permission gate, or a validation the framework does not
   already do. The floor is deliberate — not a target to push to 100% with tests
   that verify nothing.
4. **Deterministic.** No hard-coded sleeps and no arbitrary long waits. Await
   what the user would see and let MSW answer synchronously; a timeout override
   needs a sentence saying which real round trip it is waiting on.

## 4. Scope: pages and containers, not atoms

**Test the cohesive block, not each component inside it.** A project row is a
test subject; the deadline, money and age cells inside it are not — they are
covered by rendering the row. A date input is a test subject; its day, month and
year grids are covered by walking the picker.

A primitive under `src/components/ui/` earns its own test only when it carries
behaviour of its own: a permission gate, parsing, keyboard interaction,
pagination arithmetic. A thin Chakra wrapper does not.

This is the suite's main cost lever: **each test file costs about a third of a
second of wall clock before it asserts anything**, from the jsdom environment and
the module graph. Thirty redundant files is ten seconds every run, for every
engineer, forever.

## 5. Writing a test

- **Structure.** A file's test is its sibling `<file>.test.ts(x)`, one main test
  file per subject. A view may carry one extra route smoke test that mounts
  through the router; no other naming variants. Shared test infrastructure
  groups by concern under `src/tests/`.
- **Rendering.** `renderWithProviders` wraps the Chakra system, so recipes
  resolve, and react-intl with the English bundle. Pass a store only when the
  component reads Redux or RTK Query. A theme-free component can use the
  intl-only helper.
- **Strings.** Assert on the rendered English text, so a missing key surfaces as
  a failing assertion rather than a silently rendered default. Every feature
  defines its messages with a description on each entry, and every key exists in
  all three bundles.
- **Queries.** Prefer role, then label, then text — imitate how a user finds the
  thing. A test id is for surfaces with no accessible handle: the Gantt canvas
  and the router probe. Reaching for one elsewhere means the component is missing
  a label.
- **MSW.** The global handlers answer the happy path. Error and empty states are
  set up **inside the test that needs them**; handlers reset after each test, so
  an override never leaks.
- **Keep the setup path thin.** Everything the setup file reaches is imported by
  _every_ test file — which is why the fixtures deep-import their helpers rather
  than a barrel. Before adding an import under `src/tests/` or `src/mocks/`,
  check what it drags in.

## 6. Coverage

Coverage is **repo-wide** with an **80%** floor on statements, branches,
functions and lines, thought in branches. Every `.ts` and `.tsx` is on the floor;
the only exclusions are files with nothing to verify — barrels, type-only
modules, message catalogs, constants, the mocks, the bootstrap — plus the test
infrastructure itself, which is proven by the tests that consume it and its own
smoke test.

RTK Query services carry no dedicated endpoint tests: mappers are unit-tested,
and behaviour is proven through the surfaces that render it.

## 7. The end-to-end suite

Vitest pins a component against a mocked round trip. The e2e suite pins what the
unit tests structurally cannot: that the **whole app, built and served, behaves
as each role expects** — the guard, the redirect, the nav, the control that
replaces another control. One browser, one bundle, four roles.

| Covered                                                                | Not covered, on purpose                                                                                |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Where each role lands, what its nav offers, what a gated route answers | **Authorization** — the backend is the enforcer and has its own tests; this asserts what a user _sees_ |
| Which projects a role is served, and whether it can start one          | **API contracts** — a handler drifting from the backend is `pnpm seed:check`'s job                     |
| Direct action versus asking for approval, per role                     | **Backend business logic** — propagation, critical path, quota arithmetic                              |
| The approvals home: who decides and who only watches                   | **Edge cases** — empty states, error paths, validation, pagination: unit tests                         |
| Which roles may grant a role, and who may delete an account            | Anything a designer could change tomorrow without breaking anyone's work                               |
| That a project opens on its schedule and a draft on its review canvas  | **Persistence** — the mocks answer the same before and after a write                                   |

**Admission criterion — one question.** _If this stopped working, would it break
somebody's day?_ If the honest answer is no, it is a unit test. Role flow and the
load-bearing surfaces only; the suite's size is a decision, not a starting point.

One honest limit on the write scenario: with mocked HTTP the data does not
persist, so it proves the app _reacted_ — asked, reported, refreshed — not that
anything was stored.

**How it runs without a backend.** The stubs are the same MSW handlers Vitest
uses, mounted in the browser. There is no second set to keep in step: a fixture
edited for a unit test moves the e2e suite with it. The worker starts only under
the e2e build flag, so no build a user can reach contains MSW. Two handlers
answer per role, because that is what the backend does.

**A session per role, without a login.** The support fixtures plant the tokens
and the acting user before the first navigation, and pin the locale to English
so the scenarios and the screen speak the same language. Scenarios start on the
screen they are about; the only one that types into the login form is the one
about logging in. Roles are played by the seed's own people.

## 8. Writing a scenario

Feature files are Gherkin, run by playwright-bdd. Gherkin is structured natural
language: a description of **behaviour** a developer and a business analyst read
as the same sentence.

| Keyword                         | What it is                                                          |
| ------------------------------- | ------------------------------------------------------------------- |
| `Feature`                       | The title and one short paragraph: what is being described, and why |
| `Background`                    | Preconditions shared by _every_ scenario in the file                |
| `Scenario`                      | One concrete example of one behaviour                               |
| `Given`                         | The starting state                                                  |
| `When`                          | The action the person takes                                         |
| `Then`                          | The expected outcome                                                |
| `Scenario Outline` + `Examples` | The same scenario over a table of data                              |

```gherkin
Feature: Signing in

  Scenario: A signed-in person reaches their home
    Given my account is the "Owner"
    When I sign in
    Then I land on the portfolio dashboard
```

Six rules:

- **Behaviour, not interface.** No buttons, labels, clicks or selectors. "I open
  the approvals inbox", not "I click the Approvals nav button". The second breaks
  when a designer renames a button, and tells nobody what was lost when it does.
- **One behaviour per scenario**, so a red run names the rule that broke. A
  scenario that needs "and then also" is two scenarios.
- **Independent.** Every scenario stands alone, with its own `Given` and no
  ordering between them — they run in parallel, so this is not a preference.
- **Domain language.** Obra, draft, force start, approvals inbox, roster — never
  an endpoint, a role id or a column name.
- **Concrete data**, named from the seed manifest, never a UUID typed into a
  test.
- **Outcomes are business values too.** In an outline that varies only in the
  result, give the result a word from the domain: _a direct edit_ / _an approval
  request_, _offered_ / _not offered_ — the first of each pair is a product
  decision, the second a rendering detail.

Use `Background` only when the precondition really is identical for every
scenario in the file; here most files vary by role, so the role goes in each
`Given`. A `Background` half the file has to override is worse than none.

**Where the screen knowledge lives.** If a feature file may not mention a label,
something has to — and only these three places do:

| File                        | Holds                                                     |
| --------------------------- | --------------------------------------------------------- |
| `e2e/steps/*.steps.ts`      | Step definitions: locators, clicks, assertions            |
| `e2e/support/vocabulary.ts` | Business name → nav label and path                        |
| `e2e/support/screen.ts`     | Shared gestures: presence, availability, opening a select |

Renaming a nav entry is one line in the vocabulary, and no scenario changes.
That is the point of the seam.

**Accessibility is checked in the browser, once per surface.** Each feature file
carries one `Then the screen has no critical accessibility violations` on its
main screen (`e2e/steps/accessibility.steps.ts`, axe-core, WCAG 2 A/AA).
Critical impacts fail the run; serious ones — contrast, mostly — are attached
to the report as an `a11y-serious` annotation, because a contrast decision
belongs to the tone system, not to whichever scenario tripped it. `jsx-a11y`
in lint sees only static JSX; this pass sees the live DOM.

**Suite conventions.** One feature file per surface, and a new scenario joins the
one it belongs to. Steps are shared: any step defined anywhere is usable from any
feature. A scenario for a rule the UI does not implement yet is tagged
`@pending-ui` and kept out of the run by the config, with its reason beside the
tag — a red suite nobody can fix teaches the team to ignore the suite. Generated
specs are build output and are not committed.

## 9. When a bug is fixed

The fix ships with a test that fails on the old code, named for the behaviour and
not for the ticket, with a docstring saying what broke. That test stays forever:
ugly beats re-broken.
