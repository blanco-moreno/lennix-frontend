import { Stack } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useIntl } from 'react-intl'

import { Skeleton, Label, Text } from '@/components'
import { Combobox } from '@/components/ui/combobox/combobox'
import { usePermission, type AssignableOption } from '@/hooks'
import { useAssignableOptions } from '@/hooks/use-assignable-options/use-assignable-options'

import { projectManagerFieldMessages as m } from './project-manager-field-messages'

interface ProjectManagerFieldProps {
  projectId: string
  /** The selected user id, owned by the edit form. */
  value: string
  onChange: (userId: string) => void
  /**
   * Who leads the obra today. Kept selectable even when they have since left
   * the team, so opening the form never silently proposes a handover.
   */
  currentManagerId: string | null
  currentManagerName: string | null
}

/**
 * The one control that hands over an obra. Leadership is `Project.manager_id`,
 * a project attribute, so it is edited with the project. Candidates are whoever
 * the obra would accept — its team plus the organization-wide roles that reach
 * it; gated on `project.team.manage` — the backend's own key.
 */
export function ProjectManagerField({
  projectId,
  value,
  onChange,
  currentManagerId,
  currentManagerName,
}: ProjectManagerFieldProps) {
  const intl = useIntl()
  const canManageTeam = usePermission('project.team.manage')
  const {
    options: candidates,
    renderOption,
    isLoading,
    error,
  } = useAssignableOptions(projectId, { skip: !canManageTeam })

  const options = useMemo<AssignableOption[]>(() => {
    const hasCurrent = candidates.some(
      (option) => option.value === currentManagerId,
    )
    if (currentManagerId && !hasCurrent) {
      // The obra's current jefe, kept selectable even after leaving the team,
      // is not a candidate the server offered — so it carries no role badge.
      return [
        {
          value: currentManagerId,
          label: currentManagerName ?? intl.formatMessage(m.unnamedUser),
          roleSlug: null,
          isProjectMember: true,
        },
        ...candidates,
      ]
    }
    return candidates
  }, [candidates, currentManagerId, currentManagerName, intl])

  if (!canManageTeam) return null

  return (
    <Stack gap={2}>
      <Label
        color="primary"
        fontSize="sm"
        fontWeight="medium"
        htmlFor="project-manager"
      >
        {intl.formatMessage(m.label)}
      </Label>
      {isLoading ? (
        <Skeleton h={10} rounded="md" />
      ) : error ? (
        <Text size="sm" color="error">
          {intl.formatMessage(m.loadError)}
        </Text>
      ) : options.length === 0 ? (
        <Text size="sm" color="muted">
          {intl.formatMessage(m.noCandidates)}
        </Text>
      ) : (
        <>
          <Combobox
            id="project-manager"
            value={value}
            onValueChange={onChange}
            placeholder={intl.formatMessage(m.placeholder)}
            renderOption={renderOption}
            options={options}
          />
          <Text size="xs" color="muted">
            {intl.formatMessage(m.caption)}
          </Text>
        </>
      )}
    </Stack>
  )
}
