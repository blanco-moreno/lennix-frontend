import { Box, Flex, Stack } from '@chakra-ui/react'
import { Plus, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Badge, Card, EmptyState, Skeleton, SearchInput } from '@/components'
import { DataTable } from '@/components/ui/data-table'
import { PlanLimitButton, PlanUsageMeter } from '@/features'
import { usePermission } from '@/hooks'
import { useGetMeQuery } from '@/services/auth'
import {
  useGetOrganizationQuery,
  useGetOrgMembersQuery,
} from '@/services/organization'

import { AddMemberDrawer } from './components/add-member-drawer'
import { useMemberColumns } from './components/member-columns'
import {
  MemberCredentialsDialog,
  type MemberCredentials,
} from './components/member-credentials-dialog'
import { RoleScopeLegend } from './components/role-scope-legend'
import { useTeamMutations } from './hooks'
import { filterMembers } from './member-search'
import { teamManagementViewMessages } from './team-management-view-messages'

export function TeamManagementView() {
  const intl = useIntl()
  const { data: user, isLoading: isUserLoading } = useGetMeQuery()
  const organizationId = user?.organizationId ?? ''
  // Hidden (not disabled), same pattern as MemberRoleControl: admin-only,
  // mirrors the backend's `verify_organization_admin` gate on add/remove.
  const canManageTeam = usePermission('org.team.manage')

  const { data: members = [], isLoading: isMembersLoading } =
    useGetOrgMembersQuery(organizationId, { skip: !organizationId })
  // Only for the owner's id: their org role is not editable here at all,
  // so the row says so instead of letting the user discover it from a 400.
  const { data: organization } = useGetOrganizationQuery(organizationId, {
    skip: !organizationId,
  })

  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Holds the temporary credentials after a successful create, shown to the
  // admin in a dialog so they can copy/share them with the new user.
  const [createdCredentials, setCreatedCredentials] =
    useState<MemberCredentials | null>(null)

  const { handleAddMember, handleRemoveMember, isSubmitting } =
    useTeamMutations({
      organizationId,
      onMemberCreated: (credentials) => {
        setCreatedCredentials(credentials)
        setShowAddModal(false)
      },
    })

  const filteredMembers = useMemo(
    () => filterMembers(members, searchTerm),
    [members, searchTerm],
  )

  const columns = useMemberColumns({
    organizationId,
    ownerId: organization?.ownerId ?? null,
    currentUserId: user?.userId,
    canManageTeam,
    onRemoveMember: handleRemoveMember,
  })

  // Both states keep the view's own padding: an early return that drops the
  // gutter pins the placeholder to the window edge while the loaded page sits
  // inset, so the screen appears to shift when the data lands.
  if (isUserLoading) {
    return (
      <Stack gap="block" px="gutter" py="gutterY">
        <Skeleton h={40} rounded="lg" />
      </Stack>
    )
  }

  if (!organizationId) {
    return (
      <Stack gap="block" px="gutter" py="gutterY">
        <EmptyState
          title={intl.formatMessage(teamManagementViewMessages.noOrgTitle)}
          description={intl.formatMessage(
            teamManagementViewMessages.noOrgDescription,
          )}
        />
      </Stack>
    )
  }

  return (
    // A member table earns the full width: every extra pixel is column, not
    // prose. Same padding scale as the redesigned list views.
    <Stack gap="block" px="gutter" py="gutterY">
      <Flex align="center" justify="space-between" gap={3} wrap="wrap">
        <Flex align="center" gap="tight">
          <Box as={Users} boxSize={6} color="complementary" />
          <Badge variant="secondary">{members.length}</Badge>
        </Flex>
        {canManageTeam && (
          <PlanLimitButton
            resource="members"
            onClick={() => setShowAddModal(true)}
            bg="complementary"
            color="complementary.fg"
            _hover={{ bg: 'complementary/90' }}
          >
            <Box as={Plus} boxSize={4} mr={1} />
            <FormattedMessage {...teamManagementViewMessages.addMember} />
          </PlanLimitButton>
        )}
      </Flex>

      {/* Only for the role that can actually act on it — a seat count is
          noise to someone who cannot add or remove anyone. */}
      {canManageTeam && <PlanUsageMeter resource="members" />}

      <Card
        header={
          <>
            <Box as="h4" lineHeight="1">
              <FormattedMessage
                {...teamManagementViewMessages.membersCardTitle}
              />
            </Box>
            <Box as="p" color="fg.muted">
              <FormattedMessage
                {...teamManagementViewMessages.membersCardDescription}
              />
            </Box>
          </>
        }
        contentProps={{ display: 'flex', flexDirection: 'column', gap: 4 }}
      >
        <SearchInput
          w="full"
          maxW="md"
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={intl.formatMessage(
            teamManagementViewMessages.searchPlaceholder,
          )}
        />

        {members.length === 0 && !isMembersLoading ? (
          <EmptyState
            title={intl.formatMessage(teamManagementViewMessages.emptyTitle)}
            description={intl.formatMessage(
              teamManagementViewMessages.emptyDescription,
            )}
          />
        ) : (
          // The table draws its own loading rows, under its own header — no
          // separate layout standing in front of it.
          <DataTable
            columns={columns}
            data={filteredMembers}
            isLoading={isMembersLoading}
            emptyMessage={intl.formatMessage(
              teamManagementViewMessages.noMatchMessage,
            )}
          />
        )}

        {/* Under the table, not over it: the reader meets the roles in the rows
            first and comes here to find out what they mean. */}
        <RoleScopeLegend />
      </Card>

      <AddMemberDrawer
        open={showAddModal}
        isSubmitting={isSubmitting}
        onOpenChange={setShowAddModal}
        onCreate={handleAddMember}
      />

      <MemberCredentialsDialog
        credentials={createdCredentials}
        onClose={() => setCreatedCredentials(null)}
      />
    </Stack>
  )
}
