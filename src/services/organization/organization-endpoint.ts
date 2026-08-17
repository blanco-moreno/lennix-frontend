import type { UserUpdatePasswordRequestDTO } from '@/types/dto/auth-dto'
import type {
  OrganizationCreateRequestDTO,
  AddMemberRequestDTO,
  UpdateMemberSystemRoleRequestDTO,
  TransferOwnershipRequestDTO,
} from '@/types/dto/organization-dto'

export const createOrganization = (body: OrganizationCreateRequestDTO) => ({
  url: '/v1/organizations',
  method: 'POST',
  body,
})

export const listOrganizations = () => '/v1/organizations'

export const getOrganization = (id: string) => `/v1/organizations/${id}`

export const deleteOrganization = (id: string) => ({
  url: `/v1/organizations/${id}`,
  method: 'DELETE',
})

export const transferOwnership = ({
  id,
  body,
}: {
  id: string
  body: TransferOwnershipRequestDTO
}) => ({
  url: `/v1/organizations/${id}/transfer-ownership`,
  method: 'POST',
  body,
})

export const getOrgMembers = (id: string) => `/v1/organizations/${id}/members`

/**
 * `PATCH`, not `PUT`: exactly one field of a membership row is editable, the
 * same shape as the other single-field writes in this API.
 */
export const updateOrgMemberSystemRole = ({
  id,
  userId,
  body,
}: {
  id: string
  userId: string
  body: UpdateMemberSystemRoleRequestDTO
}) => ({
  url: `/v1/organizations/${id}/members/${userId}/system-role`,
  method: 'PATCH',
  body,
})

export const addOrgMember = ({
  id,
  body,
}: {
  id: string
  body: AddMemberRequestDTO
}) => ({
  url: `/v1/organizations/${id}/members`,
  method: 'POST',
  body,
})

export const removeOrgMember = ({
  id,
  userId,
}: {
  id: string
  userId: string
}) => ({
  url: `/v1/organizations/${id}/members/${userId}`,
  method: 'DELETE',
})

/** Owner over anyone; admin over everyone but the owner and other admins. */
export const resetOrgMemberPassword = ({
  id,
  userId,
  body,
}: {
  id: string
  userId: string
  body: UserUpdatePasswordRequestDTO
}) => ({
  url: `/v1/organizations/${id}/members/${userId}/password`,
  method: 'POST',
  body,
})

export const getOrgUsage = (id: string) => `/v1/organizations/${id}/usage`
