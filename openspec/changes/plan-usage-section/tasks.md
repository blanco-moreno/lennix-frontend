## 1. Contract

- [x] 1.1 `src/types/dto/organization-dto.ts`, `src/types/organization.ts`: `resolved_limits` → `{ max_team_size, max_projects, max_draft_projects, storage_mb, ai_requests (nullable), source: 'plan' | 'overrides' }`; drop `pending_enterprise_configuration`
- [x] 1.2 Mapper + mapper test + `organization-fixtures.ts` updated

## 2. PlanUsageMeter unlimited mode

- [x] 2.1 Add `showUnlimited?: boolean`; when `max === null` and set, render label + count + "no limit" message, no bar, no remaining line
- [x] 2.2 Message in `plan-usage-meter-messages.ts` and `lang/*.json`
- [x] 2.3 Extend `plan-usage-meter.test.tsx`: hidden by default, visible with the flag

## 3. Settings section

- [x] 3.1 `organization-settings-view.tsx`: replace max-team / max-projects / AI read-only fields with a "Plan usage" heading and four `PlanUsageMeter showUnlimited`; keep storage; custom badge on `source === 'overrides'`; remove the pending-Enterprise notice
- [x] 3.2 Upgrade nudge: derived from the four `usePlanLimit` verdicts (any at limit, or ≥ 2 at ≥ 80 %); one notice naming the next tier; none on Enterprise
- [x] 3.3 Messages (heading, nudge per tier, "no limit"), drop unused labels; `lang/*.json`
- [x] 3.4 Update `organization-settings-view.test.tsx` and route test: meters present, static fields gone, badge on overrides, nudge on/off cases

## 4. Gate

- [x] 4.1 `pnpm lint`, `pnpm typecheck`, `pnpm test` green
