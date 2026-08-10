# Workflow — the delivery cycle

The cycle every change in this repository follows, from branch to merge report,
the red run every test is held to, how a release is versioned and cut, and the
templates its commits and pull requests are written to. It is mandatory for
agents and humans alike. What a change must satisfy to be correct lives in
[`CONVENTIONS.md`](CONVENTIONS.md) and [`TESTING.md`](TESTING.md).

---

## 1. Setup

1. **Verify the working tree is clean.** Uncommitted changes are committed,
   stashed or discarded before anything else.
2. **Update `main` and branch from it.** Never commit to `main`.

Branch naming:

| Prefix         | For                                         |
| -------------- | ------------------------------------------- |
| `fix/<slug>`   | A defect — the app does not do what it says |
| `feat/<slug>`  | A gap or a new capability                   |
| `chore/<slug>` | Hygiene, refactor, tooling                  |
| `docs/<slug>`  | Documentation only                          |

A change that also touches `lennix-ms-bk` or `lennix-ms-ai` uses the **same
branch name** in every repository. A backend contract change lands there first,
and this repository follows with the translations for anything a user reads.
What is shared is the order the code lands, not a release: each repository
versions and releases itself ("Versioning and releases").

## 2. The red run

**No test is trusted until it has been seen failing.** A test written after the
component and green on its first run proves that it rendered, not that it checks
anything: the query may match a string that was already there, the assertion may
hold for the empty state, and nobody can tell from the diff. Seeing it red — and
red for the expected reason, not on a missing message key — is what makes it
evidence.

The red run is the rule. The order is negotiable, and only in one direction.

**Written before the code**, where the order costs little and buys the most:

- **A fix.** The reproduction is written first and run against the unfixed code.
- **A contract change.** The DTO field or closed-enum member a surface will read
  is asserted before it is rendered, against the backend change it follows.
- **Pure logic**: mappers, selectors, the permission matrix, the date and format
  helpers. No rendering in the way, so the loop is a single test and a second.

For those, work the loop: red, then the least code that makes it green, then
refactor with the suite green, then the next behaviour. No surface the test does
not ask for.

**Order free everywhere else** — laying out a screen, exploring an interaction,
any surface easier to assert once you have seen it. Write in whichever order is
quicker; the obligation is unchanged. Before the pull request opens, the test is
seen failing — revert the change, or break the line it protects — and
**Verified** names how.

- **`pnpm test` is the loop; `pnpm e2e` is not.** It builds the app, so it runs
  at the gate, never as the inner loop — including for a flow whose primary
  proof is a scenario.
- **Exempt**: documentation, formatting, tooling, and the files
  [`TESTING.md`](TESTING.md) already excludes from coverage.
- **Spike code is thrown away, never promoted.** What stays is written against a
  test that has been red.

## 3. Commit messages

```
<type>(<scope>): <subject>

<body — why, not what>
```

- **Type**: `feat` · `fix` · `docs` · `refactor` · `perf` · `test` · `chore` ·
  `ci`. A breaking change appends `!` to the type or scope (`feat(schedule)!:`).
- **Scope** is the surface or layer the change lands in — `auth`, `roles`,
  `schedule`, `import`, `approvals`, `theme`, `e2e`, `lint`, `workflow`. Omit it
  only when the change genuinely has no single home.
- **Subject**: imperative mood, lower case, no trailing period, under ~70
  characters. It says what the change _does for the reader_, not which files
  moved — `fix(roles): close four places the UI disagreed with the server`
  beats `fix(roles): update matrix.ts`.
- **Body** (optional, wrapped at ~76): the _why_. The problem the change closes,
  the constraint that shaped it, the alternative rejected. The diff already says
  what changed.
- **No attribution or tooling trailers.**

One commit is one coherent change. A branch may carry several; each should build
and pass on its own.

## 4. The quality gate

When development is done, **sync the branch with `main`** (rebase or merge) so
conflicts surface early, then run the gate in order. All of it passes locally
before a pull request opens — this gate is what decides, so it runs in full.

```bash
pnpm typecheck   # tsc --noEmit
pnpm lint        # eslint src
pnpm test        # vitest --run
pnpm e2e         # bddgen + playwright against a production build
```

`pnpm e2e` builds the app, so it is the slow one; run it last. Anything
deliberately skipped — a documentation-only change skipping `pnpm e2e` — is
named in the report with its reason.

`pnpm seed:check` when the change touches fixtures or the seed manifest, with
`LENNIX_MS_BK_PATH` pointing at a clean backend checkout.

## 5. Pull requests

**The title is the commit that lands on `main`**, because merging squashes.
Write it exactly as a commit subject — same type, same scope, same imperative
mood:

```
feat(roles): name the roles plainly and say what each one reaches
```

### The description

Three sections, always, in this order. Aim for 200–400 words: enough that a
reviewer never has to guess the intent, short enough that they read it.

```markdown
## What

Two to four sentences on the change and its scope. Lead with what the user sees
and name the surfaces and routes touched. Bullets when there are several
independent pieces.

## Why

The problem this closes, or the decision it implements. State the constraint
that shaped the solution and any alternative deliberately rejected. This is the
half of the pull request that git cannot reconstruct later.

## Verified

Each quality command and its result, plus anything exercised by hand — which
role, which route, which browser. Name what proves the change: the test seen
failing on the old code, the scenario added, the assertion that moved.
```

Add these only when they apply, after the three:

- **Screenshots or a clip** — anything visual, before and after, in the same
  viewport. A layout claim a reviewer cannot see is a claim they cannot check.
- **Contract** — a new or renamed DTO field, a new closed-enum member: state
  which backend change it follows and confirm the translations landed in all
  three locales.
- **Permissions** — a matrix change: confirm the backend's mirror moved in the
  same release, and name the roles whose surfaces change.
- **Risk** — what could break, what is deliberately out of scope, and what a
  reviewer should look at hardest.
- **Companion pull requests** — links to the ones in sibling repositories that
  must land with it, and the order they land in. They land together; they do not
  release together.

Four things a description does not carry: a file-by-file changelog (that is the
diff), the branch's own history, restated code, or a claim no command proves.

### Opening and merging

1. Open the pull request against `main` with the title and description above. A
   cross-repository change names the repositories that must land with it.
2. **A green local gate is enough to open it.** Do not wait on the remote run:
   CI (`Lint`, `Typecheck`, `Test`, `Build`, `E2E`) runs the same commands the
   gate already ran, so it confirms rather than decides. Report the local
   results as the evidence.
3. **Stop here by default** and report ("Final report" below).
4. **Only when explicitly asked**, merge: squash-merge to `main` (one commit,
   remote branch deleted), `git checkout main && git pull`, verify the top
   commit is the one you worked on, delete the local branch, then report.

## 6. When the gate fails

Iterate on the failure, re-running the failed set after each attempt, **at most
twice**. Ask before choosing when a failure implies a product or design decision
rather than an obvious technical bug.

- Push the branch to the remote regardless, so no work is lost.
- If two attempts do not resolve it: stop, open no pull request, keep the branch
  local and remote, and report what was attempted and why the gate still fails.

## 7. Versioning and releases

The version lives in one place: `version` in `package.json`. Nothing else in
this repository restates it — no constant in `src/`, no badge, no image tag.
Semantic versioning against what a user or the backend contract sees: a
breaking surface or contract change is major, a new capability is minor, a
defect closed is patch.

A release is cut from `main` in four steps, in order:

1. **Bump `version`** in `package.json` on a `chore/release-<version>` branch.
2. **Write the `CHANGELOG.md` entry** for that version — one `##` heading, what
   changed for the reader, no file-by-file diff and no invented history. It is
   the source of the release notes, so it is written once, here.
3. **Merge the branch**, gate green like any other change.
4. **Tag the merge commit** `v<version>` and publish the GitHub release from it,
   with the changelog entry as its notes.

The tag follows the merge; it never lands on an unmerged branch, and a released
tag is never moved — a release that turns out wrong is corrected by the next
patch version.

**Each repository versions and releases itself.** `lennix-ms-bk` and
`lennix-ms-ai` carry their own numbers, and this one never waits on, matches or
derives from theirs: the three deploy separately. A change that spans them
shares the order it lands in, not a version and not a tag.

## 8. Final report

Every run ends with a report covering:

- the branch and its final state — pull request open, merged, or blocked;
- the files and modules touched, and any sibling repository the change obliges;
- each quality command run and its result, including anything deliberately
  skipped and why;
- on failure: the cause, the attempts made, and the state the work is left in.
