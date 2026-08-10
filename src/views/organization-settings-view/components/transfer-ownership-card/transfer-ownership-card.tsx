import { Box, Stack } from '@chakra-ui/react'
import { UserRoundCog } from 'lucide-react'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  Button,
  Card,
  CardHeading,
  Label,
  ReadOnlyField,
  Select,
  Text,
} from '@/components'
import { Modal } from '@/components/ui/modal'
import {
  useGetOrgMembersQuery,
  useTransferOwnershipMutation,
} from '@/services/organization'
import type { Organization } from '@/types'

import { organizationSettingsViewMessages as m } from '../../organization-settings-view-messages'

interface TransferOwnershipCardProps {
  organization: Organization
}

/**
 * Owner-only surface for handing an organization to another member — the only
 * way out of ownership other than a 409 on account deletion.
 *
 * Render this only for the current owner; it does not gate itself.
 */
export function TransferOwnershipCard({
  organization,
}: TransferOwnershipCardProps) {
  const intl = useIntl()
  const [selectedUserId, setSelectedUserId] = useState('')
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const { data: members = [] } = useGetOrgMembersQuery(organization.id)
  const [transferOwnership, { isLoading: isTransferring }] =
    useTransferOwnershipMutation()

  // The backend rejects a transfer to the current owner (CannotTransferToSelf),
  // so keep them out of the picker entirely.
  const candidates = useMemo(
    () =>
      members
        .filter((member) => member.userId !== organization.ownerId)
        .map((member) => ({
          value: member.userId,
          label: `${member.user.firstName} ${member.user.lastName} — ${member.user.email}`,
        })),
    [members, organization.ownerId],
  )

  const selectedLabel =
    candidates.find((c) => c.value === selectedUserId)?.label ?? ''

  const handleTransfer = async () => {
    try {
      await transferOwnership({
        id: organization.id,
        body: { user_id: selectedUserId },
      }).unwrap()
      toast.success(
        intl.formatMessage(m.transferSuccessToast, { name: selectedLabel }),
        { id: m.transferSuccessToast.id },
      )
      setSelectedUserId('')
    } catch {
      toast.error(intl.formatMessage(m.transferErrorToast), {
        id: m.transferErrorToast.id,
      })
    }
  }

  return (
    <Card
      header={
        <CardHeading
          icon={UserRoundCog}
          title={<FormattedMessage {...m.transferCardTitle} />}
          description={<FormattedMessage {...m.transferCardDescription} />}
        />
      }
      contentProps={{ css: { '& > * + *': { mt: 4 } } }}
    >
      <ReadOnlyField label={intl.formatMessage(m.transferCurrentOwner)}>
        {`${organization.owner.firstName} ${organization.owner.lastName}`}
      </ReadOnlyField>

      {candidates.length === 0 ? (
        <Text size="sm" color="muted">
          <FormattedMessage {...m.transferNoCandidates} />
        </Text>
      ) : (
        <Stack gap="tight">
          <Stack gap={2}>
            <Label htmlFor="transfer-new-owner">
              <FormattedMessage {...m.transferSelectLabel} />
            </Label>
            <Select
              id="transfer-new-owner"
              value={selectedUserId}
              onChange={setSelectedUserId}
              options={candidates}
              placeholder={intl.formatMessage(m.transferSelectPlaceholder)}
              disabled={isTransferring}
            />
          </Stack>
          <Box>
            <Button
              variant="destructive"
              disabled={!selectedUserId || isTransferring}
              onClick={() => setIsConfirmOpen(true)}
            >
              <FormattedMessage {...m.transferButton} />
            </Button>
          </Box>
        </Stack>
      )}

      <Modal
        variant="confirmation"
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title={intl.formatMessage(m.transferConfirmTitle)}
        description={intl.formatMessage(m.transferConfirmBody, {
          name: selectedLabel,
          org: organization.name,
        })}
        confirmLabel={intl.formatMessage(m.transferConfirmAction)}
        cancelLabel={intl.formatMessage(m.transferCancel)}
        isConfirming={isTransferring}
        onConfirm={handleTransfer}
      />
    </Card>
  )
}
