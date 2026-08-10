import type {
  Organization,
  OrganizationMember,
  OrganizationUsage,
} from '@/types'
import type {
  OrganizationCreateRequestDTO,
  AddMemberRequestDTO,
  UpdateMemberSystemRoleRequestDTO,
  TransferOwnershipRequestDTO,
} from '@/types/dto/organization-dto'

import { api } from '../api-injector'
import { providesListTags } from '../cache-tags'

import {
  createOrganization,
  listOrganizations,
  getOrganization,
  deleteOrganization,
  transferOwnership,
  getOrgMembers,
  addOrgMember,
  updateOrgMemberSystemRole,
  removeOrgMember,
  getOrgUsage,
} from './organization-endpoint'
import {
  mapOrganizationResponseDTOToOrganization,
  mapOrganizationResponseDTOArrayToOrganizations,
  mapOrganizationMemberResponseDTOToOrganizationMember,
  mapOrganizationMemberResponseDTOArrayToOrganizationMembers,
  mapOrganizationUsageResponseDTOToOrganizationUsage,
} from './organization-mapper'

export const organizationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createOrganization: builder.mutation<
      Organization,
      OrganizationCreateRequestDTO
    >({
      query: createOrganization,
      transformResponse: mapOrganizationResponseDTOToOrganization,
      // 'User' too: founding your first org elevates the global role to admin
      // — refetch /me so permission-gated UI (e.g. import) unlocks.
      invalidatesTags: [{ type: 'Organization', id: 'LIST' }, 'User'],
    }),
    listOrganizations: builder.query<Organization[], void>({
      query: listOrganizations,
      transformResponse: mapOrganizationResponseDTOArrayToOrganizations,
      providesTags: providesListTags<Organization>('Organization'),
    }),
    getOrganization: builder.query<Organization, string>({
      query: getOrganization,
      transformResponse: mapOrganizationResponseDTOToOrganization,
      providesTags: (_result, _error, id) => [{ type: 'Organization', id }],
    }),
    deleteOrganization: builder.mutation<void, string>({
      query: deleteOrganization,
      invalidatesTags: (_result, _error, id) => [
        { type: 'Organization', id },
        { type: 'Organization', id: 'LIST' },
        { type: 'OrgDashboard', id },
        { type: 'OrgMembers', id },
        { type: 'OrgUsage', id },
        { type: 'Project', id: 'LIST' },
      ],
    }),
    // Ownership and the global admin role move together, so /me must be
    // refetched for both parties: the ex-owner loses admin, the new one gains
    // it, and every permission-gated surface reads that role.
    transferOwnership: builder.mutation<
      Organization,
      { id: string; body: TransferOwnershipRequestDTO }
    >({
      query: transferOwnership,
      transformResponse: mapOrganizationResponseDTOToOrganization,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Organization', id },
        { type: 'Organization', id: 'LIST' },
        { type: 'OrgMembers', id },
        { type: 'OrgDashboard', id },
        'User',
      ],
    }),
    getOrgMembers: builder.query<OrganizationMember[], string>({
      query: getOrgMembers,
      transformResponse:
        mapOrganizationMemberResponseDTOArrayToOrganizationMembers,
      providesTags: (_result, _error, id) => [{ type: 'OrgMembers', id }],
    }),
    addOrgMember: builder.mutation<
      OrganizationMember,
      { id: string; body: AddMemberRequestDTO }
    >({
      query: addOrgMember,
      transformResponse: mapOrganizationMemberResponseDTOToOrganizationMember,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'OrgMembers', id },
        { type: 'OrgUsage', id },
        { type: 'OrgDashboard', id },
        { type: 'ProjectTeam' },
      ],
    }),
    /**
     * Change one existing member's organization role in place.
     *
     * Only `OrgMembers` and the org dashboard move: the **global** role
     * (`User.roleId`) is deliberately untouched — org `admin` is a tenant
     * role, global `admin` is the owner-only rank — so `/me` must not be
     * refetched here. Ownership transfer is the flow that moves both, and it
     * already invalidates `'User'`.
     */
    updateOrgMemberSystemRole: builder.mutation<
      OrganizationMember,
      { id: string; userId: string; body: UpdateMemberSystemRoleRequestDTO }
    >({
      query: updateOrgMemberSystemRole,
      transformResponse: mapOrganizationMemberResponseDTOToOrganizationMember,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'OrgMembers', id },
        { type: 'OrgDashboard', id },
      ],
    }),
    removeOrgMember: builder.mutation<void, { id: string; userId: string }>({
      query: removeOrgMember,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'OrgMembers', id },
        { type: 'OrgUsage', id },
        { type: 'OrgDashboard', id },
        { type: 'ProjectTeam' },
        { type: 'Task' },
      ],
    }),
    getOrgUsage: builder.query<OrganizationUsage, string>({
      query: getOrgUsage,
      transformResponse: mapOrganizationUsageResponseDTOToOrganizationUsage,
      providesTags: (_result, _error, id) => [{ type: 'OrgUsage', id }],
    }),
  }),
})

export const {
  useCreateOrganizationMutation,
  useListOrganizationsQuery,
  useGetOrganizationQuery,
  useDeleteOrganizationMutation,
  useTransferOwnershipMutation,
  useGetOrgMembersQuery,
  useAddOrgMemberMutation,
  useUpdateOrgMemberSystemRoleMutation,
  useRemoveOrgMemberMutation,
  // The drafts quota meter reads plan usage, so the cap is legible
  // before an import hits the 400.
  useGetOrgUsageQuery,
} = organizationApi
