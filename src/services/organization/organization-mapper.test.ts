import {
  seedOrganizationDTO,
  seedOrganizationMemberListDTO,
  seedOrganizationUsageDTO,
  seedResolvedLimitsDTO,
} from '@/tests/fixtures'
import { SEED_IDS, SEED_ORGANIZATION } from '@/tests/seed'

import {
  mapOrganizationMemberResponseDTOArrayToOrganizationMembers,
  mapOrganizationMemberResponseDTOToOrganizationMember,
  mapOrganizationResponseDTOArrayToOrganizations,
  mapOrganizationResponseDTOToOrganization,
  mapOrganizationUsageResponseDTOToOrganizationUsage,
  readOrgMemberRoleFailure,
} from './organization-mapper'

describe('mapOrganizationResponseDTOToOrganization', () => {
  it('maps the seeded organization with its nested plan and owner', () => {
    const dto = seedOrganizationDTO()

    const org = mapOrganizationResponseDTOToOrganization(dto)

    expect(org.id).toBe(SEED_ORGANIZATION.id)
    expect(org.name).toBe(dto.name)
    expect(org.slug).toBe(dto.slug)
    expect(org.planId).toBe(SEED_ORGANIZATION.planId)
    expect(org.ownerId).toBe(SEED_IDS.USER_CARLOS_ID)
    expect(org.createdAt).toBe(dto.created_at)

    expect(org.plan.id).toBe(dto.plan.id)
    expect(org.plan.name).toBe(dto.plan.name)
    expect(org.plan.maxTeamSize).toBe(dto.plan.max_team_size)
    expect(org.plan.maxProjects).toBe(dto.plan.max_projects)

    expect(org.owner.userId).toBe(dto.owner.user_id)
    expect(org.owner.email).toBe(dto.owner.email)
    expect(org.owner.firstName).toBe(dto.owner.first_name)
    expect(org.owner.lastName).toBe(dto.owner.last_name)
  })

  it('maps the resolved limits block field by field', () => {
    const dto = seedOrganizationDTO()

    const limits = mapOrganizationResponseDTOToOrganization(dto).resolvedLimits

    expect(limits.maxTeamSize).toBe(dto.resolved_limits.max_team_size)
    expect(limits.maxProjects).toBe(dto.resolved_limits.max_projects)
    expect(limits.maxDraftProjects).toBe(dto.resolved_limits.max_draft_projects)
    expect(limits.storageMb).toBe(dto.resolved_limits.storage_mb)
    expect(limits.aiRequests).toBe(dto.resolved_limits.ai_requests)
    expect(limits.source).toBe('plan')
  })

  it('keeps an unlimited ceiling null', () => {
    const dto = seedOrganizationDTO({
      resolved_limits: seedResolvedLimitsDTO({
        max_projects: null,
        ai_requests: null,
        source: 'overrides',
      }),
    })

    const limits = mapOrganizationResponseDTOToOrganization(dto).resolvedLimits

    expect(limits.maxProjects).toBeNull()
    expect(limits.aiRequests).toBeNull()
    expect(limits.source).toBe('overrides')
  })

  it('maps an organization array one to one', () => {
    const dtos = [seedOrganizationDTO()]

    const orgs = mapOrganizationResponseDTOArrayToOrganizations(dtos)

    expect(orgs).toHaveLength(1)
    expect(orgs[0].id).toBe(SEED_ORGANIZATION.id)
  })
})

describe('organization member mapping', () => {
  it('maps a member row with its nested user', () => {
    const dto = seedOrganizationMemberListDTO()[0]

    const member = mapOrganizationMemberResponseDTOToOrganizationMember(dto)

    expect(member.id).toBe(dto.id)
    expect(member.organizationId).toBe(SEED_ORGANIZATION.id)
    expect(member.userId).toBe(dto.user_id)
    expect(member.joinedAt).toBe(dto.joined_at)
    expect(member.user.userId).toBe(dto.user.user_id)
    expect(member.user.email).toBe(dto.user.email)
    expect(member.user.firstName).toBe(dto.user.first_name)
    expect(member.user.lastName).toBe(dto.user.last_name)
    expect(member.user.roleId).toBe(dto.user.role_id)
    expect(member.user.roleSlug).toBe(dto.user.role_slug)
  })

  it('maps all eight seeded members in order', () => {
    const dtos = seedOrganizationMemberListDTO()

    const members =
      mapOrganizationMemberResponseDTOArrayToOrganizationMembers(dtos)

    expect(members).toHaveLength(SEED_ORGANIZATION.members.length)
    expect(members.map((member) => member.userId)).toEqual(
      dtos.map((dto) => dto.user_id),
    )
  })
})

describe('mapOrganizationUsageResponseDTOToOrganizationUsage', () => {
  it('maps every quota counter without crossing the pairs', () => {
    const dto = seedOrganizationUsageDTO()

    const usage = mapOrganizationUsageResponseDTOToOrganizationUsage(dto)

    expect(usage.organizationId).toBe(SEED_ORGANIZATION.id)
    expect(usage.currentTeamSize).toBe(dto.current_team_size)
    expect(usage.maxTeamSize).toBe(dto.max_team_size)
    expect(usage.currentProjects).toBe(dto.current_projects)
    expect(usage.maxProjects).toBe(dto.max_projects)
    expect(usage.currentDrafts).toBe(dto.current_drafts)
    expect(usage.maxDrafts).toBe(dto.max_drafts)
  })
})

describe('readOrgMemberRoleFailure', () => {
  const roleError = (code: string) => ({
    status: 400,
    data: { detail: { code } },
  })

  it('reads the structured role-change codes', () => {
    expect(
      readOrgMemberRoleFailure(roleError('owner_system_role_immutable')),
    ).toEqual({ code: 'owner_system_role_immutable' })
    expect(
      readOrgMemberRoleFailure(roleError('cannot_change_own_system_role')),
    ).toEqual({ code: 'cannot_change_own_system_role' })
  })

  // The rule about the ACTOR — only the owner grants or revokes `admin` — is a
  // 403, not a 400. Reading only 400 dropped it into the generic error.
  it('reads the 403 the admin-only rule answers with', () => {
    expect(
      readOrgMemberRoleFailure({
        ...roleError('only_owner_manages_admins'),
        status: 403,
      }),
    ).toEqual({ code: 'only_owner_manages_admins' })
  })

  it('validates the cast: an unknown code falls through to null', () => {
    expect(readOrgMemberRoleFailure(roleError('some_new_code'))).toBeNull()
  })

  it('returns null for everything that is not a structured refusal', () => {
    expect(readOrgMemberRoleFailure(null)).toBeNull()
    expect(readOrgMemberRoleFailure('boom')).toBeNull()
    expect(
      readOrgMemberRoleFailure({
        ...roleError('owner_system_role_immutable'),
        status: 500,
      }),
    ).toBeNull()
    expect(readOrgMemberRoleFailure({ status: 400 })).toBeNull()
    expect(readOrgMemberRoleFailure({ status: 400, data: 'oops' })).toBeNull()
    expect(readOrgMemberRoleFailure({ status: 400, data: {} })).toBeNull()
    expect(
      readOrgMemberRoleFailure({ status: 400, data: { detail: 'plain' } }),
    ).toBeNull()
    expect(
      readOrgMemberRoleFailure({ status: 400, data: { detail: { code: 7 } } }),
    ).toBeNull()
  })
})
