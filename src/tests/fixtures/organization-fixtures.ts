/** `/v1/organizations`, `/v1/plans` and `/v1/roles` responses for the seed. */

import {
  SEED_ORGANIZATION,
  SEED_PLANS,
  SEED_PROJECTS,
  SEED_ROLES,
  type SeedPlan,
} from '@/tests/seed'
import type { SystemRoleSlug } from '@/types'
import type {
  MemberUserResponseDTO,
  OrganizationMemberResponseDTO,
  OrganizationResponseDTO,
  OrganizationUsageResponseDTO,
  OwnerResponseDTO,
  PlanSummaryResponseDTO,
  ResolvedLimitsResponseDTO,
} from '@/types/dto/organization-dto'
import type { PlanResponseDTO } from '@/types/dto/plan-dto'
import type { RoleResponseDTO } from '@/types/dto/role-dto'

import { FIXTURE_CREATED_AT, seedUser } from './seed-lookup'

function seedPlan(planId: number): SeedPlan {
  const plan = SEED_PLANS.find((candidate) => candidate.id === planId)
  if (!plan) throw new Error(`plan ${planId} is not in the seed manifest`)
  return plan
}

export function seedPlanDTO(planId: number): PlanResponseDTO {
  const plan = seedPlan(planId)
  return {
    id: plan.id,
    name: plan.name,
    max_team_size: plan.maxTeamSize,
    max_projects: plan.maxProjects,
    storage_mb: plan.storageMb,
    ai_requests: plan.aiRequests,
    created_at: FIXTURE_CREATED_AT,
  }
}

export function seedPlanListDTO(): PlanResponseDTO[] {
  return SEED_PLANS.map((plan) => seedPlanDTO(plan.id))
}

export function seedPlanSummaryDTO(planId: number): PlanSummaryResponseDTO {
  const plan = seedPlan(planId)
  return {
    id: plan.id,
    name: plan.name,
    max_team_size: plan.maxTeamSize,
    max_projects: plan.maxProjects,
  }
}

export function seedRoleDTO(roleId: number): RoleResponseDTO {
  const role = SEED_ROLES.find((candidate) => candidate.id === roleId)
  if (!role) throw new Error(`role ${roleId} is not in the seed manifest`)
  return { ...role }
}

export function seedRoleListDTO(): RoleResponseDTO[] {
  return SEED_ROLES.map((role) => ({ ...role }))
}

export function seedOwnerDTO(): OwnerResponseDTO {
  const owner = seedUser(SEED_ORGANIZATION.ownerId)
  return {
    user_id: owner.userId,
    email: owner.email,
    first_name: owner.firstName,
    last_name: owner.lastName,
  }
}

/**
 * The org sits on plan 2 (Pro), so its limits resolve from the plan.
 * `enterprise_terms` exist but stay inert until the org moves to plan 3 — see
 * `SEED_ENTERPRISE_TERMS` for that variant.
 */
export function seedResolvedLimitsDTO(): ResolvedLimitsResponseDTO {
  const plan = seedPlan(SEED_ORGANIZATION.planId)
  return {
    max_team_size: plan.maxTeamSize,
    max_projects: plan.maxProjects,
    storage_mb: plan.storageMb,
    ai_requests: plan.aiRequests,
    source: 'plan',
    pending_enterprise_configuration: false,
  }
}

export function seedOrganizationDTO(
  overrides?: Partial<OrganizationResponseDTO>,
): OrganizationResponseDTO {
  return {
    id: SEED_ORGANIZATION.id,
    name: SEED_ORGANIZATION.name,
    slug: SEED_ORGANIZATION.slug,
    plan_id: SEED_ORGANIZATION.planId,
    owner_id: SEED_ORGANIZATION.ownerId,
    created_at: FIXTURE_CREATED_AT,
    plan: seedPlanSummaryDTO(SEED_ORGANIZATION.planId),
    owner: seedOwnerDTO(),
    resolved_limits: seedResolvedLimitsDTO(),
    ...overrides,
  }
}

function seedMemberUserDTO(userId: string): MemberUserResponseDTO {
  const user = seedUser(userId)
  return {
    user_id: user.userId,
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    role_id: user.roleId,
    role_slug: seedRoleDTO(user.roleId).slug as SystemRoleSlug,
  }
}

/** All eight members, in seed order. Membership carries no role. */
export function seedOrganizationMemberListDTO(): OrganizationMemberResponseDTO[] {
  return SEED_ORGANIZATION.members.map((member, index) => ({
    id: index + 1,
    organization_id: SEED_ORGANIZATION.id,
    user_id: member.userId,
    joined_at: FIXTURE_CREATED_AT,
    user: seedMemberUserDTO(member.userId),
  }))
}

/**
 * Usage counts the live projects only — the pending draft doesn't consume the
 * plan quota until it is approved.
 */
export function seedOrganizationUsageDTO(): OrganizationUsageResponseDTO {
  const plan = seedPlan(SEED_ORGANIZATION.planId)
  return {
    organization_id: SEED_ORGANIZATION.id,
    current_team_size: SEED_ORGANIZATION.members.length,
    max_team_size: plan.maxTeamSize,
    current_projects: SEED_PROJECTS.filter((project) => !project.isDraft)
      .length,
    max_projects: plan.maxProjects,
    // The pending drafts and their own ceiling — what the Borradores quota
    // meter renders.
    current_drafts: SEED_PROJECTS.filter((project) => project.isDraft).length,
    max_drafts: plan.maxDraftProjects,
    current_ai_requests: 0,
    max_ai_requests: plan.aiRequests,
  }
}
