import type { GrantableRoleSlug, SystemRoleSlug } from '../organization'

/** POST /v1/organizations — request */
export interface OrganizationCreateRequestDTO {
  name: string
  slug: string
}

export interface OwnerResponseDTO {
  user_id: string
  email: string
  first_name: string
  last_name: string
}

export interface PlanSummaryResponseDTO {
  id: number
  name: string
  max_team_size: number | null
  max_projects: number | null
}

export interface ResolvedLimitsResponseDTO {
  max_team_size: number | null
  max_projects: number | null
  max_draft_projects: number | null
  storage_mb: number | null
  ai_requests: number | null
  source: 'plan' | 'overrides'
}

/** Organization endpoints — response */
export interface OrganizationResponseDTO {
  id: string
  name: string
  slug: string
  plan_id: number
  owner_id: string
  created_at: string
  plan: PlanSummaryResponseDTO
  owner: OwnerResponseDTO
  resolved_limits: ResolvedLimitsResponseDTO
}

/** PUT /v1/organizations/:id — request */
export interface OrganizationUpdateRequestDTO {
  name?: string | null
  slug?: string | null
}

export interface MemberUserResponseDTO {
  user_id: string
  email: string
  first_name: string
  last_name: string
  role_id: number
  role_slug: SystemRoleSlug | null
}

export interface OrganizationMemberResponseDTO {
  id: number
  organization_id: string
  user_id: string
  joined_at: string
  user: MemberUserResponseDTO
}

/** POST /v1/organizations/:id/members — request */
export interface AddMemberRequestDTO {
  user_id: string
  /** `^(member|admin)$` server-side — the API has always required it. */
}

/**
 * PATCH /v1/organizations/:id/members/:userId — request.
 *
 * The one editable field on an existing membership row: everything else
 * (`user_id`, `organization_id`, `joined_at`) is identity or history. Same
 * vocabulary as `AddMemberRequestDTO`, so the team surface has one role list.
 */
export interface UpdateMemberSystemRoleRequestDTO {
  role_slug: GrantableRoleSlug
}

/** GET /v1/organizations/:id/usage — response */
export interface OrganizationUsageResponseDTO {
  organization_id: string
  current_team_size: number
  max_team_size: number | null
  current_projects: number
  max_projects: number | null
  current_drafts: number
  max_drafts: number | null
  current_ai_requests: number
  max_ai_requests: number | null
  current_storage_mb: number
  max_storage_mb: number | null
}

/** PUT /v1/organizations/:id/plan — request */
export interface UpdatePlanRequestDTO {
  plan_id: number
}

/** POST /v1/organizations/:id/transfer-ownership — request.
 *  The target must already be a member; the global admin role travels with
 *  ownership, so the previous owner is demoted in the same transaction. */
export interface TransferOwnershipRequestDTO {
  user_id: string
}
