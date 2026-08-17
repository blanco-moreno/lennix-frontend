import { http, HttpResponse } from 'msw'

import {
  seedOrganizationDTO,
  seedOrganizationMemberListDTO,
  seedOrganizationUsageDTO,
  seedPlanSummaryDTO,
  seedUser,
} from '@/tests/fixtures'
import { SEED_IDS, SEED_PLANS } from '@/tests/seed'

export const createOrgHandler = http.post('*/v1/organizations', () => {
  return HttpResponse.json(seedOrganizationDTO(), { status: 201 })
})

export const listOrgsHandler = http.get('*/v1/organizations', () => {
  return HttpResponse.json([seedOrganizationDTO()])
})

export const getOrgHandler = http.get(
  '*/v1/organizations/:organizationId',
  () => {
    return HttpResponse.json(seedOrganizationDTO())
  },
)

export const updateOrgHandler = http.put(
  '*/v1/organizations/:organizationId',
  () => {
    return HttpResponse.json(
      seedOrganizationDTO({
        name: `${seedOrganizationDTO().name} (Updated)`,
      }),
    )
  },
)

export const deleteOrgHandler = http.delete(
  '*/v1/organizations/:organizationId',
  () => {
    return new HttpResponse(null, { status: 204 })
  },
)

export const getOrgMembersHandler = http.get(
  '*/v1/organizations/:organizationId/members',
  () => {
    return HttpResponse.json(seedOrganizationMemberListDTO())
  },
)

/** Adding a member echoes the new row; Pedro stands in for the added user. */
export const addOrgMemberHandler = http.post(
  '*/v1/organizations/:organizationId/members',
  () => {
    const members = seedOrganizationMemberListDTO()
    const user = seedUser(SEED_IDS.USER_PEDRO_ID)
    return HttpResponse.json(
      {
        ...members[members.length - 1],
        id: members.length + 1,
        role: 'member',
        user: {
          user_id: user.userId,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          role_id: user.roleId,
        },
        user_id: user.userId,
      },
      { status: 201 },
    )
  },
)

/** Echoes the member row back with the role the request asked for. */
export const updateOrgMemberRoleHandler = http.patch(
  '*/v1/organizations/:organizationId/members/:userId/system-role',
  async ({ request, params }) => {
    const { role_slug } = (await request.json()) as { role_slug: string }
    const members = seedOrganizationMemberListDTO()
    const target =
      members.find((member) => member.user_id === params.userId) ?? members[0]
    return HttpResponse.json({ ...target, role: role_slug })
  },
)

export const removeOrgMemberHandler = http.delete(
  '*/v1/organizations/:organizationId/members/:userId',
  () => {
    return new HttpResponse(null, { status: 204 })
  },
)

export const resetOrgMemberPasswordHandler = http.post(
  '*/v1/organizations/:organizationId/members/:userId/password',
  () => {
    return new HttpResponse(null, { status: 204 })
  },
)

export const orgUsageHandler = http.get(
  '*/v1/organizations/:organizationId/usage',
  () => {
    return HttpResponse.json(seedOrganizationUsageDTO())
  },
)

/** Upgrading the demo org to Enterprise — the plan the seed's terms unlock. */
export const updatePlanHandler = http.put(
  '*/v1/organizations/:organizationId/plan',
  () => {
    const enterprise = SEED_PLANS[SEED_PLANS.length - 1]
    return HttpResponse.json(
      seedOrganizationDTO({
        plan_id: enterprise.id,
        plan: seedPlanSummaryDTO(enterprise.id),
      }),
    )
  },
)

export const transferOwnershipHandler = http.post(
  '*/v1/organizations/:organizationId/transfer-ownership',
  async ({ request }) => {
    const body = (await request.json()) as { user_id: string }
    return HttpResponse.json(seedOrganizationDTO({ owner_id: body.user_id }))
  },
)

export const organizationHandlers = [
  createOrgHandler,
  listOrgsHandler,
  getOrgHandler,
  updateOrgHandler,
  deleteOrgHandler,
  transferOwnershipHandler,
  getOrgMembersHandler,
  addOrgMemberHandler,
  updateOrgMemberRoleHandler,
  removeOrgMemberHandler,
  resetOrgMemberPasswordHandler,
  orgUsageHandler,
  updatePlanHandler,
]
