# Documentation index

The routing table for `docs/`: which document answers which question, what does
_not_ belong in it, and what obliges an update. It carries no content of its own
— open the document, not this page.

---

| Document                             | Answers                                                                                                                                                                                     | Does **not** cover                                                                                                         | Update it when                                                                                          |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| [`PRODUCT.md`](PRODUCT.md)           | What the app lets each role do, screen by screen, and the experience rules that make it the product rather than a view of the API                                                           | Definitions of domain terms and business rules → `lennix-ms-bk/docs/DOMAIN.md`. How any of it is built → `ARCHITECTURE.md` | A surface, a flow, or what a role is offered changes                                                    |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | How the app is built: the stack, the layout, the data layer, routing, permissions, i18n, the import and schedule surfaces, deployment                                                       | What the UI must guarantee → `PRODUCT.md`. How the code is shaped → `CONVENTIONS.md`                                       | A layer, a data-flow rule, a route mechanism or a build mode changes                                    |
| [`CONVENTIONS.md`](CONVENTIONS.md)   | The rules code and documentation are written under: the scaffold, the dependency rule, barrels, loading and empty states, the data layer, the documentation standard, the maintenance rules | How to test → `TESTING.md`. How to ship → `WORKFLOW.md`                                                                    | A structural, styling, data-layer, documentation or maintenance rule changes                            |
| [`TESTING.md`](TESTING.md)           | What a test is here, seed-derived data, the unit suite, coverage, and the end-to-end suite including how to write a scenario                                                                | What the code must do → `PRODUCT.md`                                                                                       | A fixture convention, the coverage floor, a test rule or the e2e scope changes                          |
| [`WORKFLOW.md`](WORKFLOW.md)         | The delivery cycle: branch, the red run, commit, quality gate, PR, merge, versioning, releases, report — with the commit-message and pull-request templates                                 | What makes a change correct → `CONVENTIONS.md` / `TESTING.md`                                                              | A quality command, CI job, branch rule, message template, release step or reporting requirement changes |

**The domain is not defined in this repository.** Entities, states, transitions
and business rules are canonical in `lennix-ms-bk/docs/DOMAIN.md`, cited here by
rule id (`TEN-4`, `IMP-7`). This app uses that vocabulary and enforces none of
it — the backend does.

Future work for all three repositories lives in
`lennix-ms-bk/docs/ROADMAP.md` and `lennix-ms-bk/docs/BACKLOG_ROADMAP.md`.

## Rules

- **Adding, removing or re-scoping a document in this folder updates this index
  in the same PR.** A document missing from the table does not exist.
- **A breaking change updates the affected documents in the same PR.** The full
  rule is in [`CONVENTIONS.md`](CONVENTIONS.md).
- Documentation outside this folder is local and stays local: the repository
  [`README.md`](../README.md) and [`AGENTS.md`](../AGENTS.md).
