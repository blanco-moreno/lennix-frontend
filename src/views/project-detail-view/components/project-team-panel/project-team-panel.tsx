import { Box, Flex, Stack } from '@chakra-ui/react'
import type { ColumnDef } from '@tanstack/react-table'
import { Users, Plus, ExternalLink } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import {
  Button,
  ErrorState,
  Badge,
  ConfirmActionButton,
  Heading,
  Text,
  RequirePermission,
} from '@/components'
import { DataTable } from '@/components/ui/data-table'
import { PATHS } from '@/constants'
import { usePermission } from '@/hooks'
import { useFormatDate } from '@/i18n'
import {
  useGetProjectTeamQuery,
  useRemoveTeamMemberMutation,
} from '@/services/project'
import type { ProjectMember } from '@/types'

import { projectDetailViewMessages } from '../../project-detail-view-messages'
import { AssignMemberDrawer } from '../assign-member-drawer'

import { projectTeamPanelMessages as m } from './project-team-panel-messages'

interface ProjectTeamPanelProps {
  projectId: string
  projectName: string
  organizationId: string
}

export function ProjectTeamPanel({
  projectId,
  projectName,
  organizationId,
}: ProjectTeamPanelProps) {
  const intl = useIntl()
  const formatDate = useFormatDate()
  const navigate = useNavigate()
  const canManageTeam = usePermission('project.team.manage')
  const {
    data: members = [],
    isLoading,
    error,
  } = useGetProjectTeamQuery(projectId)
  const [removeMember] = useRemoveTeamMemberMutation()
  const [showAddModal, setShowAddModal] = useState(false)

  const existingMemberUserIds = useMemo(
    () => new Set(members.map((mem) => mem.userId)),
    [members],
  )

  const handleRemoveMember = useCallback(
    async (memberUserId: string) => {
      try {
        await removeMember({ projectId, userId: memberUserId }).unwrap()
        toast.success(intl.formatMessage(m.removeMemberSuccess), {
          id: m.removeMemberSuccess.id,
        })
      } catch {
        toast.error(intl.formatMessage(m.removeMemberError), {
          id: m.removeMemberError.id,
        })
      }
    },
    [removeMember, projectId, intl],
  )

  const columns = useMemo<ColumnDef<ProjectMember>[]>(
    () => [
      {
        accessorKey: 'memberName',
        header: intl.formatMessage(m.columnMember),
        cell: ({ row }) => {
          const { memberName, memberEmail, isManager } = row.original
          return (
            <Flex direction="column" gap={2}>
              <Flex align="center" gap={2}>
                <Text size="sm" weight="medium">
                  {memberName ?? intl.formatMessage(m.unnamedUser)}
                </Text>
                {/* A label, never a control. The obra is handed over from the
                    project form — a second write path here would duplicate it. */}
                {isManager && (
                  <Badge
                    variant="complementary"
                    fontSize="10px"
                    data-testid="member-manager-badge"
                  >
                    <FormattedMessage {...m.managerBadge} />
                  </Badge>
                )}
              </Flex>
              <Text size="xs" color="muted">
                {memberEmail ?? '—'}
              </Text>
            </Flex>
          )
        },
      },
      {
        accessorKey: 'joinedAt',
        header: intl.formatMessage(m.columnJoinedAt),
        cell: ({ getValue }) => formatDate(getValue<string>()),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) =>
          // The manager is a member by construction, so their row has no remove
          // control — the backend answers 409, and offering a button that can
          // only fail is worse than not offering one.
          canManageTeam && !row.original.isManager ? (
            <Flex justify="flex-end">
              <ConfirmActionButton
                title={<FormattedMessage {...m.removeDialogTitle} />}
                description={
                  <FormattedMessage {...m.removeDialogDescription} />
                }
                cancelLabel={
                  <FormattedMessage {...projectDetailViewMessages.cancel} />
                }
                confirmLabel={<FormattedMessage {...m.removeButton} />}
                onConfirm={async () => handleRemoveMember(row.original.userId)}
              />
            </Flex>
          ) : null,
      },
    ],
    [handleRemoveMember, intl, canManageTeam, formatDate],
  )

  return (
    <Stack gap={4}>
      {/* Header — this panel assigns people to the project; it is not a second
          place to create or delete them. The roster lives in Settings.

          Add and remove, nothing else: membership is the only thing a project
          row carries. Who *leads* the obra is `Project.manager_id` and is
          edited with the project. */}
      {/* Side by side where there is room. On a phone the button dropped off
          the right edge instead of yielding, so below `lg` it takes its own
          line under the heading. */}
      <Flex
        direction={{ base: 'column', lg: 'row' }}
        align={{ base: 'stretch', lg: 'start' }}
        justify={{ lg: 'space-between' }}
        gap={4}
      >
        <Stack gap={1}>
          <Heading
            size="h3"
            weight="semibold"
            color="primary"
            display="flex"
            alignItems="center"
            gap={2}
          >
            <Box as={Users} boxSize={5} color="complementary" />
            <FormattedMessage
              {...m.teamHeading}
              values={{ count: members.length }}
            />
          </Heading>
          <Text size="sm" color="muted">
            <FormattedMessage {...m.teamScopeCaption} />
          </Text>
          <Button
            variant="ghost"
            size="sm"
            alignSelf="start"
            onClick={async () => navigate(PATHS.TEAM_MANAGEMENT)}
          >
            <FormattedMessage {...m.teamRosterLink} />
            <Box as={ExternalLink} boxSize={3.5} ml={1} />
          </Button>
        </Stack>
        <RequirePermission permission="project.team.manage">
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            flexShrink={0}
            alignSelf={{ base: 'flex-start', lg: 'auto' }}
          >
            <Box as={Plus} boxSize={4} mr={1} />
            <FormattedMessage {...m.addMemberButton} />
          </Button>
        </RequirePermission>
      </Flex>

      {/* Add Member Modal */}
      <AssignMemberDrawer
        projectId={projectId}
        projectName={projectName}
        organizationId={organizationId}
        existingMemberUserIds={existingMemberUserIds}
        open={showAddModal}
        onOpenChange={setShowAddModal}
      />

      {/* Table */}
      {error ? (
        <ErrorState message={<FormattedMessage {...m.teamLoadError} />} />
      ) : (
        <DataTable
          columns={columns}
          data={members}
          isLoading={isLoading}
          emptyMessage={intl.formatMessage(m.noTeamMembers)}
        />
      )}
    </Stack>
  )
}
