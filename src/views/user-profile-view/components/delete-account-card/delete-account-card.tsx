import { Box, Stack } from '@chakra-ui/react'
import { ArrowRightLeft, Trash2, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { Button, Card, CardHeading, Text } from '@/components'
import { Modal } from '@/components/ui/modal'
import { PATHS } from '@/constants'
import { useCurrentRole } from '@/hooks'
import type { ApiError } from '@/services'
import { useDeleteMeMutation } from '@/services/auth'
import { useDeleteOrganizationMutation } from '@/services/organization'
import { useAppDispatch } from '@/stores'
import { clearAuth } from '@/stores/slices/auth-slice'
import type { Organization } from '@/types'

import { userProfileViewMessages as m } from '../../user-profile-view-messages'

interface DeleteAccountCardProps {
  /** The organization the user owns, if any. */
  ownedOrganization: Organization | null
}

type OpenModal = 'none' | 'confirm' | 'ownerDecision' | 'confirmDeleteOrg'

/**
 * Account deletion, including the owner's fork in the road.
 *
 * The backend refuses to delete an owner's account with a 409 while their
 * organization still exists, so the owner is asked up front whether to
 * transfer the organization or destroy it along with the account.
 *
 * Shown only to the two organization-wide roles. A `manager` or a `user`
 * belongs to somebody else's organization: their account is the admin's to
 * remove from the team, not theirs to delete out from under the obras they are
 * on. Read from the role rather than a permission key — the matrix is a mirror
 * of `matrix.py`, and the server gates this one on ownership, not on a grant.
 */
export function DeleteAccountCard({
  ownedOrganization,
}: DeleteAccountCardProps) {
  const intl = useIntl()
  const role = useCurrentRole()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [openModal, setOpenModal] = useState<OpenModal>('none')

  const [deleteMe, { isLoading: isDeletingAccount }] = useDeleteMeMutation()
  const [deleteOrganization, { isLoading: isDeletingOrg }] =
    useDeleteOrganizationMutation()
  const isBusy = isDeletingAccount || isDeletingOrg

  const finishDeletion = () => {
    // `clearAuth` rather than `handleLogout()`: the latter raises its own
    // "signed out" toast, which would stack on top of this one.
    dispatch(clearAuth())
    toast.success(intl.formatMessage(m.deleteSuccessToast), {
      id: m.deleteSuccessToast.id,
    })
    navigate(PATHS.LOGIN)
  }

  /**
   * `orgAlreadyDeleted` matters: once the organization is gone there is no way
   * back, so a failure after that point must say so — otherwise the user reads
   * "could not delete your account", assumes nothing happened, and is left in a
   * shell account whose every request 403s.
   */
  const reportFailure = (err: unknown, orgAlreadyDeleted: boolean) => {
    if (orgAlreadyDeleted) {
      toast.error(
        intl.formatMessage(m.deleteOrgSucceededAccountFailedToast, {
          org: ownedOrganization?.name ?? '',
        }),
        { id: m.deleteOrgSucceededAccountFailedToast.id },
      )
      return
    }
    const apiError = err as ApiError
    // 409: still an owner. Reachable if ownership changed in another tab.
    if (apiError.status === 409) {
      toast.error(intl.formatMessage(m.deleteOwnerConflictToast), {
        id: m.deleteOwnerConflictToast.id,
      })
      return
    }
    toast.error(intl.formatMessage(m.deleteErrorToast), {
      id: m.deleteErrorToast.id,
    })
  }

  const deleteAccount = async (orgAlreadyDeleted: boolean) => {
    try {
      await deleteMe().unwrap()
      finishDeletion()
    } catch (err) {
      reportFailure(err, orgAlreadyDeleted)
    }
  }

  const handleDeleteAccount = async () => deleteAccount(false)

  const handleDeleteOrgAndAccount = async () => {
    if (!ownedOrganization) return
    try {
      await deleteOrganization(ownedOrganization.id).unwrap()
    } catch {
      toast.error(intl.formatMessage(m.deleteOrgErrorToast), {
        id: m.deleteOrgErrorToast.id,
      })
      return
    }
    await deleteAccount(true)
  }

  const orgName = ownedOrganization?.name ?? ''

  if (role !== 'owner' && role !== 'admin') return null

  return (
    <Card
      header={
        <CardHeading
          icon={TriangleAlert}
          tone="destructive"
          title={<FormattedMessage {...m.dangerZoneTitle} />}
          description={<FormattedMessage {...m.dangerZoneDescription} />}
        />
      }
    >
      <Button
        variant="destructive"
        disabled={isBusy}
        onClick={() =>
          setOpenModal(ownedOrganization ? 'ownerDecision' : 'confirm')
        }
      >
        <Box as={Trash2} boxSize={4} mr={2} />
        <FormattedMessage {...m.deleteAccountButton} />
      </Button>

      {/* Plain path — the user owns nothing, just confirm. */}
      <Modal
        variant="confirmation"
        open={openModal === 'confirm'}
        onOpenChange={(open) => setOpenModal(open ? 'confirm' : 'none')}
        title={intl.formatMessage(m.deleteConfirmTitle)}
        description={intl.formatMessage(m.deleteConfirmBody)}
        confirmLabel={intl.formatMessage(m.deleteConfirmAction)}
        cancelLabel={intl.formatMessage(m.cancel)}
        isConfirming={isBusy}
        onConfirm={handleDeleteAccount}
      />

      {/* Owner fork — transfer the organization, or destroy it with the account. */}
      <Modal
        open={openModal === 'ownerDecision'}
        onOpenChange={(open) => setOpenModal(open ? 'ownerDecision' : 'none')}
        size="sm"
        icon={TriangleAlert}
        iconColor="destructive"
        title={intl.formatMessage(m.ownerDecisionTitle, { org: orgName })}
        description={intl.formatMessage(m.ownerDecisionBody, { org: orgName })}
      >
        <Stack gap={4}>
          <Stack gap={2}>
            <Text weight="medium">
              <FormattedMessage {...m.ownerDecisionTransferTitle} />
            </Text>
            <Text size="sm" color="muted">
              <FormattedMessage {...m.ownerDecisionTransferBody} />
            </Text>
            <Box>
              <Button
                variant="outline"
                onClick={() => {
                  setOpenModal('none')
                  navigate(PATHS.SETTINGS)
                }}
              >
                <Box as={ArrowRightLeft} boxSize={4} mr={2} />
                <FormattedMessage {...m.ownerDecisionTransferAction} />
              </Button>
            </Box>
          </Stack>

          <Stack gap={2} borderTopWidth="1px" borderColor="border" pt={4}>
            <Text weight="medium">
              <FormattedMessage {...m.ownerDecisionDeleteOrgTitle} />
            </Text>
            <Text size="sm" color="muted">
              <FormattedMessage
                {...m.ownerDecisionDeleteOrgBody}
                values={{ org: orgName }}
              />
            </Text>
            <Box>
              <Button
                variant="destructive"
                disabled={isBusy}
                onClick={() => setOpenModal('confirmDeleteOrg')}
              >
                <Box as={Trash2} boxSize={4} mr={2} />
                <FormattedMessage {...m.ownerDecisionDeleteOrgAction} />
              </Button>
            </Box>
          </Stack>
        </Stack>
      </Modal>

      {/* Last stop before destroying the organization. */}
      <Modal
        variant="confirmation"
        open={openModal === 'confirmDeleteOrg'}
        onOpenChange={(open) =>
          setOpenModal(open ? 'confirmDeleteOrg' : 'none')
        }
        title={intl.formatMessage(m.deleteOrgConfirmTitle, { org: orgName })}
        description={intl.formatMessage(m.deleteOrgConfirmBody, {
          org: orgName,
        })}
        confirmLabel={intl.formatMessage(m.ownerDecisionDeleteOrgAction)}
        cancelLabel={intl.formatMessage(m.cancel)}
        isConfirming={isBusy}
        onConfirm={handleDeleteOrgAndAccount}
      />
    </Card>
  )
}
