import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { useIntl } from 'react-intl'

import type { TeamMemberCreateFormValues } from '@/schemas'
import type { ApiError } from '@/services'
import { useRegisterMutation } from '@/services/auth'
import {
  useAddOrgMemberMutation,
  useRemoveOrgMemberMutation,
} from '@/services/organization'
import { generateTempPassword } from '@/utils'

import type { MemberCredentials } from '../../components/member-credentials-dialog'
import { teamManagementViewMessages } from '../../team-management-view-messages'

interface UseTeamMutationsOptions {
  organizationId: string
  onMemberCreated: (credentials: MemberCredentials) => void
}

/** The two team mutations — create-and-add a member, remove a member — with their toasts. */
export function useTeamMutations({
  organizationId,
  onMemberCreated,
}: UseTeamMutationsOptions) {
  const intl = useIntl()

  const [registerUser, { isLoading: isRegistering }] = useRegisterMutation()
  const [addMember, { isLoading: isAdding }] = useAddOrgMemberMutation()
  const [removeMember] = useRemoveOrgMemberMutation()

  const isSubmitting = isRegistering || isAdding

  const handleAddMember = async (
    data: TeamMemberCreateFormValues,
  ): Promise<boolean> => {
    if (!organizationId) return false

    const password = generateTempPassword()

    try {
      // The backend assigns the role server-side; the client must not send
      // role_id. Membership carries none either — a new teammate starts as a
      // `user` and is granted a role afterwards.
      const created = await registerUser({
        email: data.email.trim(),
        password,
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
      }).unwrap()

      await addMember({
        id: organizationId,
        body: { user_id: created.userId },
      }).unwrap()

      toast.success(
        intl.formatMessage(teamManagementViewMessages.memberCreatedToast),
        { id: teamManagementViewMessages.memberCreatedToast.id },
      )
      onMemberCreated({ email: data.email.trim(), password })
      return true
    } catch (error) {
      toast.error(
        (error as ApiError).message ??
          intl.formatMessage(teamManagementViewMessages.createMemberError),
        { id: teamManagementViewMessages.createMemberError.id },
      )
      return false
    }
  }

  const handleRemoveMember = useCallback(
    async (userId: string) => {
      if (!organizationId) return
      try {
        await removeMember({ id: organizationId, userId }).unwrap()
        toast.success(
          intl.formatMessage(teamManagementViewMessages.memberRemovedToast),
          { id: teamManagementViewMessages.memberRemovedToast.id },
        )
      } catch (error) {
        toast.error(
          (error as ApiError).message ??
            intl.formatMessage(teamManagementViewMessages.removeMemberError),
          { id: teamManagementViewMessages.removeMemberError.id },
        )
      }
    },
    [organizationId, removeMember, intl],
  )

  return { handleAddMember, handleRemoveMember, isSubmitting }
}
