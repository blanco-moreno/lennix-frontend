## Context

`PlanUsageMeter` (features) reads `usePlanLimit(resource)` (hooks) which reads `GET /organizations/:id/usage` via RTK Query; the meter returns `null` when `max === null`. `OrganizationSettingsView` reads `resolvedLimits` from the organization record and renders static fields. Both queries are already cached; rendering four meters in settings adds no request.

## Goals / Non-Goals

**Goals:** one section, zero new data paths; unlimited is a visible fact in settings.

**Non-Goals:** a `/settings/plan` route; storage or token metering; billing/history/self-service; changing `usePlanLimit`; a customer-profile signal for the nudge (usage is the trigger).

## Decisions

- **Section inside the Organization card, not a new route.** Chosen over `/settings/plan` (like `/settings/team`) because there is nothing else to put on that page yet; a route can be added when billing arrives.
- **`showUnlimited` prop on `PlanUsageMeter`** rather than a second component: the label/remaining vocabulary per resource already lives in `PLAN_METER_COPY`; the unlimited branch reuses the label and swaps the count line for a shared "no limit" message. Alternative — always show unlimited — rejected: the contextual placements' comment ("a meter that can never fill asks the user to worry") still holds there.
- **Meters visible to every member.** Usage is not sensitive and the team meter's `canManageTeam` gate on the team page was about the actions beside it, not the number.
- **Remove the redundant static ceilings**; keep storage. Follows the "one fact, one place" rule the card already states.
- **Nudge is derived from `usePlanLimit` verdicts, in the view.** Rule: any `isAtLimit`, or ≥ 2 resources with `used / max ≥ 0.8`. Copy names the next tier by plan name; no link, no CTA target exists. Rejected: a backend "recommend upgrade" field — the FE already has every number.
- **Contract mapping.** `source: 'overrides'` drives the custom badge; `aiRequests` nullable renders "no limit".

## Risks / Trade-offs

- [Card grows tall next to the transfer-ownership card] → the meters use `Card size="compact"`; the grid already stretches heights.
- [Enterprise-with-terms shows template ceilings until ms-bk change ships] → temporarily "no limit" on team/projects; correct after backend deploy, no FE change needed.
