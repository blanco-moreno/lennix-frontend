import { Box, Stack } from '@chakra-ui/react'
import { AlertTriangle, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import {
  Alert,
  Button,
  Modal,
  Text,
  commonMessages,
  Label,
  Select,
} from '@/components'
import { PATHS } from '@/constants'
import { useCurrentRole, usePermission } from '@/hooks'
import {
  readOrgMemberRoleFailure,
  useUpdateOrgMemberSystemRoleMutation,
} from '@/services/organization'
import {
  GRANTABLE_ROLE_SLUGS,
  type GrantableRoleSlug,
  type OrganizationMember,
  type OrgMemberRoleFailure,
  type SystemRoleSlug,
} from '@/types'
import { systemRoleHelpMessages, systemRoleMessages } from '@/utils'

import { memberRoleControlMessages as m } from './member-role-control-messages'

interface MemberRoleControlProps {
  organizationId: string
  member: OrganizationMember
  /** The org owner's user id, when it is known. */
  ownerId: string | null
}

/**
 * Grant one member a system role. `owner` is not offered — it moves only by
 * transferring ownership, and the backend refuses the value at its contract.
 * `admin` is offered only to the owner (D-D), and another admin's row shows no
 * control at all — only the owner may move it, either way. Hidden (not
 * disabled) without `user.role.manage`.
 */
/** The role the dialog opens on. `owner` is not grantable, so an owner's row
 *  opens on the lowest rank rather than on a value the Select cannot show. */
function currentGrantable(member: OrganizationMember): GrantableRoleSlug {
  const slug = member.user.roleSlug
  return slug && slug !== 'owner' ? slug : 'user'
}

export function MemberRoleControl({
  organizationId,
  member,
  ownerId,
}: MemberRoleControlProps) {
  const intl = useIntl()
  const navigate = useNavigate()
  const canManageRoles = usePermission('user.role.manage')
  // D-D: only the owner grants or revokes `admin`. An admin still grants
  // `manager` and `user`, so the option is filtered, not the whole control.
  const actorRole = useCurrentRole()
  const actorIsOwner = actorRole === 'owner'
  const grantableSlugs = GRANTABLE_ROLE_SLUGS.filter(
    (slug) => slug !== 'admin' || actorIsOwner,
  )
  // Never open on a value the Select cannot show — an admin looking at another
  // admin's row has no `admin` option, so the dialog opens on the lowest rank.
  const initialRole = (): GrantableRoleSlug => {
    const current = currentGrantable(member)
    return grantableSlugs.includes(current) ? current : 'user'
  }
  const [updateRole, { isLoading }] = useUpdateOrgMemberSystemRoleMutation()

  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<GrantableRoleSlug>(initialRole())
  const [failure, setFailure] = useState<OrgMemberRoleFailure | null>(null)
  const [genericError, setGenericError] = useState(false)

  const isOwner = ownerId !== null && member.userId === ownerId

  // Reset on open rather than in an effect: opening the dialog *is* the event,
  // so there is nothing to synchronize after the fact.
  const openDialog = () => {
    setRole(initialRole())
    setFailure(null)
    setGenericError(false)
    setOpen(true)
  }

  if (!canManageRoles) return null

  // Revoking `admin` is the owner's too, not only granting it: an admin who
  // opened this on another admin could only ever demote them, and the server
  // answers that with a 403. Name the row instead of offering the refusal.
  if (member.user.roleSlug === 'admin' && !actorIsOwner) {
    return (
      <Text size="xs" color="muted" alignSelf="center">
        {intl.formatMessage(m.adminRowHint)}
      </Text>
    )
  }

  const roleLabel = (value: SystemRoleSlug) =>
    intl.formatMessage(systemRoleMessages[value])

  const handleSubmit = async () => {
    setFailure(null)
    setGenericError(false)
    try {
      await updateRole({
        id: organizationId,
        userId: member.userId,
        body: { role_slug: role },
      }).unwrap()
      toast.success(
        intl.formatMessage(m.successToast, {
          firstName: member.user.firstName,
          role: roleLabel(role),
        }),
        { id: m.successToast.id },
      )
      setOpen(false)
    } catch (error) {
      const structured = readOrgMemberRoleFailure(error)
      if (structured) setFailure(structured)
      else setGenericError(true)
    }
  }

  // The owner's role is not editable here at all — it moves only with
  // ownership. Name the row rather than offering a control that is
  // guaranteed to 400.
  if (isOwner) {
    return (
      <Text size="xs" color="muted" alignSelf="center">
        {intl.formatMessage(m.ownerRowHint)}
      </Text>
    )
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={openDialog}>
        <Box as={ShieldCheck} boxSize={3.5} mr={1} />
        <FormattedMessage {...m.trigger} />
      </Button>

      <Modal
        open={open}
        onOpenChange={(next) => (next ? openDialog() : setOpen(false))}
        title={intl.formatMessage(m.title)}
        description={intl.formatMessage(m.description, {
          firstName: member.user.firstName,
          lastName: member.user.lastName,
        })}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              <FormattedMessage {...commonMessages.cancel} />
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <FormattedMessage {...commonMessages.saving} />
              ) : (
                <FormattedMessage {...m.submit} />
              )}
            </Button>
          </>
        }
      >
        <Stack gap={4}>
          <Stack gap={2}>
            <Label htmlFor="member-org-role">
              {intl.formatMessage(m.fieldLabel)}
            </Label>
            <Select
              id="member-org-role"
              value={role}
              onChange={(value) => setRole(value as GrantableRoleSlug)}
              options={grantableSlugs.map((slug) => ({
                value: slug,
                label: roleLabel(slug),
              }))}
            />
            <Text size="xs" color="muted">
              {intl.formatMessage(systemRoleHelpMessages[role])}
            </Text>
          </Stack>

          {failure?.code === 'owner_system_role_immutable' && (
            <Alert variant="error" icon={AlertTriangle}>
              <Stack gap={2} align="flex-start">
                <Text weight="medium" size="sm">
                  {intl.formatMessage(m.ownerImmutableTitle)}
                </Text>
                <Text size="sm">
                  {intl.formatMessage(m.ownerImmutableBody)}
                </Text>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => navigate(PATHS.SETTINGS)}
                >
                  {intl.formatMessage(m.goToTransferOwnership)}
                </Button>
              </Stack>
            </Alert>
          )}

          {failure?.code === 'only_owner_manages_admins' && (
            <Alert variant="error" icon={AlertTriangle}>
              <Stack gap={2} align="flex-start">
                <Text weight="medium" size="sm">
                  {intl.formatMessage(m.onlyOwnerAdminsTitle)}
                </Text>
                <Text size="sm">
                  {intl.formatMessage(m.onlyOwnerAdminsBody)}
                </Text>
              </Stack>
            </Alert>
          )}

          {failure?.code === 'cannot_change_own_system_role' && (
            <Alert variant="error" icon={AlertTriangle}>
              <Stack gap={2} align="flex-start">
                <Text weight="medium" size="sm">
                  {intl.formatMessage(m.selfEditTitle)}
                </Text>
                <Text size="sm">{intl.formatMessage(m.selfEditBody)}</Text>
              </Stack>
            </Alert>
          )}

          {genericError && (
            <Alert variant="error" icon={AlertTriangle}>
              <Text size="sm">{intl.formatMessage(m.genericError)}</Text>
            </Alert>
          )}
        </Stack>
      </Modal>
    </>
  )
}
