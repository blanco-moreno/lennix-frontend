## Purpose

Gives every organization member one place to see how much of each metered plan resource is consumed and what its ceiling is, so the meters spread across the product have a home.

## ADDED Requirements

### Requirement: Settings shows plan usage for every metered resource

The Organization section of settings SHALL show, for live projects, pending drafts, team seats and AI requests of the current month, the current count and the effective ceiling, using the same numbers and thresholds as the contextual meters (amber from 80%, alert at the cap).

#### Scenario: Plan with ceilings

- **WHEN** a member of a Pro organization opens settings
- **THEN** four meters render with `used of max`, a bar and the remaining headroom for each resource

#### Scenario: Organization with overrides

- **WHEN** a member of an organization with plan overrides opens settings
- **THEN** each meter renders the overridden ceiling where one exists and the plan's elsewhere, and the plan badge is accompanied by the custom badge

### Requirement: Unlimited resources are visible in settings

In settings, a resource with no ceiling SHALL render its current count with a "no limit" label and no bar; contextual meters elsewhere SHALL keep rendering nothing for an unlimited resource.

#### Scenario: Enterprise drafts

- **WHEN** an Enterprise member opens settings
- **THEN** the drafts meter shows the pending-draft count with "no limit" and no bar

#### Scenario: Contextual meter stays silent

- **WHEN** an Enterprise member opens the drafts home
- **THEN** no drafts meter renders

### Requirement: Upgrade nudge from usage

When any metered resource is at its ceiling, or at least two are at 80 % or more, the settings section SHALL show one notice naming the next plan tier; no notice SHALL show on Enterprise or when overrides raise the ceilings enough that neither condition holds.

#### Scenario: Pro near the cap

- **WHEN** a Pro organization has 11 of 12 live projects and 17 of 20 seats
- **THEN** the section shows one notice pointing to Enterprise

#### Scenario: Comfortable usage

- **WHEN** no resource is at its ceiling and fewer than two are at 80 %
- **THEN** no notice renders

### Requirement: Entitlements that are not measured stay static

Storage SHALL remain a read-only entitlement in the Organization card; ceilings that the meters already carry SHALL not be repeated as static fields.

#### Scenario: Card content

- **WHEN** the Organization card renders
- **THEN** it shows name, plan badges, storage and the plan-usage meters, and no separate max-team / max-projects / AI-requests fields
