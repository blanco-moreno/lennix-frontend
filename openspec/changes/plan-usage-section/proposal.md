## Why

Plan consumption is scattered: the projects meter lives on the projects home, drafts on the drafts home, seats on the team page (managers only) and the AI meter only inside the import upload canvas. There is no single place where a user can answer "how much of my plan have I used and where is the ceiling". The organization settings card shows the entitlements (`resolvedLimits`) but not the consumption, and it hides unlimited resources entirely.

## What Changes

- The Organization card in `/settings` gains a **Plan usage** section: the four existing `PlanUsageMeter` bars (projects, drafts, members, AI this month) stacked under the plan badge, read from `GET /organizations/:id/usage` through the existing `usePlanLimit` hook.
- The static read-only fields for max team size, max projects and AI requests are removed from that card — the meters carry `used / max`; storage stays as a read-only entitlement (it is not measured).
- `PlanUsageMeter` gains an opt-in `showUnlimited` mode: when the ceiling is `null` it renders the current count with a "no limit" label and no bar, instead of rendering nothing. Existing contextual placements keep hiding unlimited resources.
- **BREAKING (contract, with ms-bk `honor-enterprise-terms-in-quotas`)**: `resolvedLimits` becomes `{ maxTeamSize, maxProjects, maxDraftProjects, storageMb, aiRequests (nullable), source: 'plan' | 'overrides' }`; `pendingEnterpriseConfiguration` disappears and so does its notice. The "custom plan" badge shows when `source === 'overrides'`.
- Usage nudge: when a resource is at its cap, or two or more are at ≥ 80 %, the section shows one upgrade notice pointing to the next tier (Basic → Pro, Pro → Enterprise; nothing on Enterprise). Copy only — no link target exists yet.

## Capabilities

### New Capabilities

- `plan-usage-visibility`: one place in settings where the plan's consumption and ceilings are visible for every metered resource, including unlimited ones.

### Modified Capabilities

<!-- none -->

## Impact

- `src/features/plan-usage-meter/*` (new prop + messages + test), `src/views/organization-settings-view/*` (section, nudge, messages, tests), `src/types/{organization,dto/organization-dto}.ts`, `src/services/organization/organization-mapper*.ts`, `src/tests/fixtures/organization-fixtures.ts`, `lang/*.json`.
- Deploy together with ms-bk `honor-enterprise-terms-in-quotas`.
- No new route, service, hook or API call.
