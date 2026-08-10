import { Flex } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { RoleBadge } from '@/components'
import { useGetAssignableMembersQuery } from '@/services/project'
import type { RoleSlug } from '@/utils'

export interface AssignableOption {
  value: string
  label: string
  /** `null` for a slug this build has no label for. */
  roleSlug: RoleSlug | null
  isProjectMember: boolean
}

export interface AssignableOptions {
  options: AssignableOption[]
  /** Hand straight to `Combobox.renderOption`. */
  renderOption: (option: AssignableOption) => ReactNode
  isLoading: boolean
  error: unknown
}

/**
 * The candidates behind every "responsable" and "jefe de obra" dropdown.
 *
 * Reads `assignable-members`, not the obra's roster: an `owner`/`admin` is
 * accepted on every obra of their organization without holding a membership
 * row, and a picker fed by the roster left them out of a list the backend would
 * have taken. Whoever is offered without being on the team is badged with their
 * role, so picking one is not a guess about who that is.
 *
 * The endpoint answers with the **wide** set — every member of the organization,
 * which is what naming a jefe de obra accepts, because that write seats whoever
 * is named. An activity or subactivity assignee goes through the narrower gate,
 * so those pickers pass `workAssignableOnly` and get only the rows the backend
 * would take; offering the rest earns a 400.
 */
export function useAssignableOptions(
  projectId: string,
  options: { skip?: boolean; workAssignableOnly?: boolean } = {},
): AssignableOptions {
  const {
    data = [],
    isLoading,
    error,
  } = useGetAssignableMembersQuery(projectId, {
    skip: options.skip || !projectId,
  })

  const rows = options.workAssignableOnly
    ? data.filter((member) => member.isWorkAssignable)
    : data

  return {
    options: rows.map((member) => ({
      value: member.userId,
      label: member.memberName || member.memberEmail || member.userId,
      roleSlug: member.roleSlug,
      isProjectMember: member.isProjectMember,
    })),
    renderOption,
    isLoading,
    error,
  }
}

function renderOption(option: AssignableOption): ReactNode {
  if (option.isProjectMember || !option.roleSlug) return option.label
  return (
    <Flex align="center" justify="space-between" gap={2}>
      {option.label}
      <RoleBadge role={option.roleSlug} />
    </Flex>
  )
}
