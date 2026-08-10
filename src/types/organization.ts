import type { RoleSlug } from '@/utils'

/**
 * The structured refusals
 * `PATCH /v1/organizations/:id/members/:userId/system-role` answers with
 * (`OrganizationErrorCode` in ms-bk). Each names a rule the team surface has to
 * explain, and a way out — which it can only do from a code, not from an
 * English sentence it would have to parse.
 *
 * Two are 400s about the target row; `only_owner_manages_admins` is a 403 about
 * the actor — only the owner grants or revokes `admin`.
 */
export type OrgMemberRoleErrorCode =
  | 'owner_system_role_immutable'
  | 'cannot_change_own_system_role'
  | 'only_owner_manages_admins'

export interface OrgMemberRoleFailure {
  code: OrgMemberRoleErrorCode
}

export interface Owner {
  userId: string
  email: string
  firstName: string
  lastName: string
}

export interface PlanSummary {
  id: number
  name: string
  maxTeamSize: number | null
  maxProjects: number | null
}

export interface ResolvedLimits {
  maxTeamSize: number | null
  maxProjects: number | null
  storageMb: number
  aiRequests: number
  source: 'plan' | 'enterprise_terms'
  pendingEnterpriseConfiguration: boolean
}

export interface Organization {
  id: string
  name: string
  slug: string
  planId: number
  ownerId: string
  createdAt: string
  plan: PlanSummary
  owner: Owner
  resolvedLimits: ResolvedLimits
}

export interface MemberUser {
  userId: string
  email: string
  firstName: string
  lastName: string
  roleId: number
  /**
   * The system role — the **only** role axis.
   *
   * `organization_member` carries none: it is the tenancy link. What a person
   * may do is this, and administering the organization is simply being `admin`.
   */
  roleSlug: SystemRoleSlug | null
}

/**
 * The four roles the permission matrix is keyed on.
 *
 * An alias rather than a second union: `permissions/roles.ts` owns this
 * vocabulary, and two hand-written copies would drift.
 */
export type SystemRoleSlug = RoleSlug

/**
 * What a grant may set — the three non-`owner` roles.
 *
 * `owner` moves only by transferring ownership, so the backend refuses it at
 * the contract and this union says so at compile time. `admin` is grantable,
 * but only *by* the owner (D-D) — an actor rule, not a value rule, so it is
 * filtered where the actor is known rather than removed from the union.
 */
export type GrantableRoleSlug = Exclude<SystemRoleSlug, 'owner'>

export const GRANTABLE_ROLE_SLUGS: readonly GrantableRoleSlug[] = [
  'admin',
  'manager',
  'user',
]

export interface OrganizationMember {
  id: number
  organizationId: string
  userId: string
  joinedAt: string
  user: MemberUser
}

/**
 * The plan's counters and their ceilings.
 *
 * Every `maxX` is nullable, and `null` means UNLIMITED, never "unknown":
 * Enterprise carries no ceiling on any of the three. `usePlanLimit` is the one
 * place that reads these — nothing else should re-derive the rule.
 */
export interface OrganizationUsage {
  organizationId: string
  currentTeamSize: number
  maxTeamSize: number | null
  currentProjects: number
  maxProjects: number | null
  /**
   * The pending-draft ceiling. Drafts have their own cap and are
   * charged against `maxProjects` only when they go live, so the Borradores
   * quota meter reads these — not the project quota.
   */
  currentDrafts: number
  maxDrafts: number | null
}
