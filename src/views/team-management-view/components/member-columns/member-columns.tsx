import { Box, Flex } from '@chakra-ui/react'
import type { ColumnDef } from '@tanstack/react-table'
import { KeyRound } from 'lucide-react'
import { useMemo } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Badge, ConfirmActionButton, RoleBadge, Text } from '@/components'
import { useCurrentRole } from '@/hooks'
import { useFormatDate } from '@/i18n'
import type { OrganizationMember, SystemRoleSlug } from '@/types'

import { teamManagementViewMessages } from '../../team-management-view-messages'
import { MemberRoleControl } from '../member-role-control'

interface UseMemberColumnsOptions {
  organizationId: string
  ownerId: string | null
  currentUserId: string | undefined
  canManageTeam: boolean
  onRemoveMember: (userId: string) => Promise<void>
  onResetPassword: (userId: string, email: string) => Promise<void>
}

/** The members-table column definitions: name, role badge, joined-at, actions. */
export function useMemberColumns({
  organizationId,
  ownerId,
  currentUserId,
  canManageTeam,
  onRemoveMember,
  onResetPassword,
}: UseMemberColumnsOptions): ColumnDef<OrganizationMember>[] {
  const intl = useIntl()
  const formatDate = useFormatDate()
  // TEN-16: the owner regenerates anyone's password; an admin everyone's but
  // the owner's and other admins'. The backend is the authority — this only
  // hides the button where the request would be refused.
  const actorIsOwner = useCurrentRole() === 'owner'

  return useMemo<ColumnDef<OrganizationMember>[]>(
    () => [
      {
        id: 'name',
        header: intl.formatMessage(teamManagementViewMessages.columnMember),
        accessorFn: (row) =>
          `${row.user.firstName} ${row.user.lastName}`.trim() || row.user.email,
        cell: ({ row }) => {
          const m = row.original
          const fullName =
            `${m.user.firstName} ${m.user.lastName}`.trim() || m.user.email
          const isSelf = m.userId === currentUserId
          return (
            <Flex direction="column" gap={2}>
              <Text as="span" size="sm" weight="medium">
                {fullName}
                {isSelf && (
                  <Badge variant="complementary" ml={2} fontSize="10px">
                    <FormattedMessage
                      {...teamManagementViewMessages.youBadge}
                    />
                  </Badge>
                )}
              </Text>
              <Text as="span" size="xs" color="muted">
                {m.user.email}
              </Text>
            </Flex>
          )
        },
      },
      {
        accessorKey: 'user.roleSlug',
        header: intl.formatMessage(teamManagementViewMessages.columnRole),
        enableSorting: false,
        cell: ({ getValue }) => {
          const role = getValue<SystemRoleSlug | null>()
          if (!role) return null
          return <RoleBadge role={role} />
        },
      },
      {
        accessorKey: 'joinedAt',
        header: intl.formatMessage(teamManagementViewMessages.columnJoinedAt),
        cell: ({ getValue }) => formatDate(getValue<string>()),
      },
      {
        id: 'actions',
        header: () => (
          <Box as="span" textAlign="right">
            <FormattedMessage {...teamManagementViewMessages.columnActions} />
          </Box>
        ),
        enableSorting: false,
        cell: ({ row }) => {
          const member = row.original
          const isSelf = member.userId === currentUserId
          const targetIsPrivileged =
            member.userId === ownerId ||
            member.user.roleSlug === 'owner' ||
            member.user.roleSlug === 'admin'
          const canResetPassword =
            canManageTeam && !isSelf && (actorIsOwner || !targetIsPrivileged)
          return (
            <Flex justify="flex-end" gap={2}>
              <MemberRoleControl
                organizationId={organizationId}
                member={member}
                ownerId={ownerId}
              />
              {canResetPassword && (
                <ConfirmActionButton
                  icon={KeyRound}
                  variant="outline"
                  aria-label={intl.formatMessage(
                    teamManagementViewMessages.resetPasswordTitle,
                  )}
                  title={intl.formatMessage(
                    teamManagementViewMessages.resetPasswordTitle,
                  )}
                  description={intl.formatMessage(
                    teamManagementViewMessages.resetPasswordDescription,
                    {
                      firstName: member.user.firstName,
                      lastName: member.user.lastName,
                    },
                  )}
                  cancelLabel={intl.formatMessage(
                    teamManagementViewMessages.cancel,
                  )}
                  confirmLabel={intl.formatMessage(
                    teamManagementViewMessages.resetPasswordConfirm,
                  )}
                  onConfirm={async () =>
                    onResetPassword(member.userId, member.user.email)
                  }
                />
              )}
              {canManageTeam && (
                <ConfirmActionButton
                  disabled={isSelf}
                  title={intl.formatMessage(
                    teamManagementViewMessages.removeMemberTitle,
                  )}
                  description={intl.formatMessage(
                    teamManagementViewMessages.removeMemberDescription,
                    {
                      firstName: member.user.firstName,
                      lastName: member.user.lastName,
                    },
                  )}
                  cancelLabel={intl.formatMessage(
                    teamManagementViewMessages.cancel,
                  )}
                  confirmLabel={intl.formatMessage(
                    teamManagementViewMessages.remove,
                  )}
                  onConfirm={async () => onRemoveMember(member.userId)}
                />
              )}
            </Flex>
          )
        },
      },
    ],
    [
      actorIsOwner,
      canManageTeam,
      onRemoveMember,
      onResetPassword,
      currentUserId,
      intl,
      organizationId,
      ownerId,
      formatDate,
    ],
  )
}
