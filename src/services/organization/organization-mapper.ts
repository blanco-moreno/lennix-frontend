import type {
  Organization,
  OrganizationMember,
  OrganizationUsage,
  OrgMemberRoleErrorCode,
  OrgMemberRoleFailure,
} from '@/types'
import type {
  OrganizationMemberResponseDTO,
  OrganizationResponseDTO,
  OrganizationUsageResponseDTO,
} from '@/types/dto/organization-dto'

export function mapOrganizationResponseDTOToOrganization(
  dto: OrganizationResponseDTO,
): Organization {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    planId: dto.plan_id,
    ownerId: dto.owner_id,
    createdAt: dto.created_at,
    plan: {
      id: dto.plan.id,
      name: dto.plan.name,
      maxTeamSize: dto.plan.max_team_size,
      maxProjects: dto.plan.max_projects,
    },
    owner: {
      userId: dto.owner.user_id,
      email: dto.owner.email,
      firstName: dto.owner.first_name,
      lastName: dto.owner.last_name,
    },
    resolvedLimits: {
      maxTeamSize: dto.resolved_limits.max_team_size,
      maxProjects: dto.resolved_limits.max_projects,
      storageMb: dto.resolved_limits.storage_mb,
      aiRequests: dto.resolved_limits.ai_requests,
      source: dto.resolved_limits.source,
      pendingEnterpriseConfiguration:
        dto.resolved_limits.pending_enterprise_configuration,
    },
  }
}

export function mapOrganizationMemberResponseDTOToOrganizationMember(
  dto: OrganizationMemberResponseDTO,
): OrganizationMember {
  return {
    id: dto.id,
    organizationId: dto.organization_id,
    userId: dto.user_id,
    joinedAt: dto.joined_at,
    user: {
      userId: dto.user.user_id,
      email: dto.user.email,
      firstName: dto.user.first_name,
      lastName: dto.user.last_name,
      roleId: dto.user.role_id,
      roleSlug: dto.user.role_slug,
    },
  }
}

export function mapOrganizationUsageResponseDTOToOrganizationUsage(
  dto: OrganizationUsageResponseDTO,
): OrganizationUsage {
  return {
    organizationId: dto.organization_id,
    currentTeamSize: dto.current_team_size,
    maxTeamSize: dto.max_team_size,
    currentProjects: dto.current_projects,
    maxProjects: dto.max_projects,
    currentDrafts: dto.current_drafts,
    maxDrafts: dto.max_drafts,
    currentAiRequests: dto.current_ai_requests,
    maxAiRequests: dto.max_ai_requests,
  }
}

export function mapOrganizationResponseDTOArrayToOrganizations(
  dto: OrganizationResponseDTO[],
): Organization[] {
  return dto.map(mapOrganizationResponseDTOToOrganization)
}

export function mapOrganizationMemberResponseDTOArrayToOrganizationMembers(
  dto: OrganizationMemberResponseDTO[],
): OrganizationMember[] {
  return dto.map(mapOrganizationMemberResponseDTOToOrganizationMember)
}

const ORG_MEMBER_ROLE_ERROR_CODES: readonly OrgMemberRoleErrorCode[] = [
  'owner_system_role_immutable',
  'cannot_change_own_system_role',
  'only_owner_manages_admins',
]

/**
 * The statuses ms-bk answers a structured role refusal with: 400 for a rule
 * about the target row, 403 for one about the actor. Reading only 400 is what
 * dropped `only_owner_manages_admins` into the generic "something went wrong".
 */
const ROLE_FAILURE_STATUSES = [400, 403]

/**
 * Read ms-bk's structured role-change refusal (`OrganizationErrorCode`).
 *
 * Returns `null` for anything else so the caller can fall through to its
 * generic error path. Both codes name a rule with a way out — transfer
 * ownership, ask the owner, promote somebody first — and a generic "something went wrong"
 * toast here is a worse product than no button at all.
 */
export function readOrgMemberRoleFailure(
  error: unknown,
): OrgMemberRoleFailure | null {
  if (!error || typeof error !== 'object') return null
  const status = (error as { status?: unknown }).status
  if (typeof status !== 'number' || !ROLE_FAILURE_STATUSES.includes(status)) {
    return null
  }
  const data = (error as { data?: unknown }).data
  if (!data || typeof data !== 'object') return null
  const detail = (data as { detail?: unknown }).detail
  if (!detail || typeof detail !== 'object') return null
  const code = (detail as { code?: unknown }).code
  if (typeof code !== 'string') return null
  if (!ORG_MEMBER_ROLE_ERROR_CODES.includes(code as OrgMemberRoleErrorCode)) {
    return null
  }
  return { code: code as OrgMemberRoleErrorCode }
}
