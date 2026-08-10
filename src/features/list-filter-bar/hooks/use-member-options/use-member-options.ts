import { useGetMeQuery } from '@/services/auth'
import { useGetOrgMembersQuery } from '@/services/organization'
import type { SelectOption } from '@/theme/recipes/select.recipe'

/**
 * Everyone in the organization, as picker options.
 *
 * The whole roster, deliberately: `GET /v1/organizations/{id}/members` is not
 * paginated (a team has a plan-capped ceiling, not a long tail), so unlike the
 * project picker there is nothing past a first page to search for. What both
 * pickers refuse to do is the same thing — build a name map out of the rows on
 * screen, which offers only the people who happen to be on this page.
 */
export function useMemberOptions(): {
  options: SelectOption[]
  isLoading: boolean
} {
  const { data: me } = useGetMeQuery()
  const organizationId = me?.organizationId ?? ''

  const { data, isFetching } = useGetOrgMembersQuery(organizationId, {
    skip: !organizationId,
  })

  return {
    options: (data ?? []).map((member) => ({
      value: member.user.userId,
      label: `${member.user.firstName} ${member.user.lastName}`.trim(),
    })),
    isLoading: isFetching,
  }
}
