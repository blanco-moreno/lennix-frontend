import { Stack } from '@chakra-ui/react'
import { useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useIntl } from 'react-intl'

import { Skeleton, Modal, FormField, ModalFormFooter, Text } from '@/components'
import { Combobox } from '@/components/ui/combobox/combobox'
import { useZodResolverIntl } from '@/i18n'
import {
  assignMemberSchema,
  projectValidationMessages,
  type AssignMemberFormValues,
} from '@/schemas'
import { useGetOrgMembersQuery } from '@/services/organization'
import { useAddTeamMemberMutation } from '@/services/project'

import { assignMemberModalMessages as m } from './assign-member-drawer-messages'

interface AssignMemberDrawerProps {
  projectId: string
  /** Named in the drawer subtitle so it is clear which project gains a member. */
  projectName: string
  organizationId: string
  existingMemberUserIds: ReadonlySet<string>
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Adding somebody to an obra is membership, nothing more — there is no role
 * field on the wire. Who *runs* the obra is edited with the project (the
 * manager picker in the edit modal), not here.
 */
const INITIAL_FORM: AssignMemberFormValues = { userId: '' }

export function AssignMemberDrawer({
  projectId,
  projectName,
  organizationId,
  existingMemberUserIds,
  open,
  onOpenChange,
}: AssignMemberDrawerProps) {
  const intl = useIntl()
  const {
    data: orgMembers = [],
    isLoading: isLoadingOrgMembers,
    error: orgMembersError,
  } = useGetOrgMembersQuery(organizationId, { skip: !organizationId || !open })

  const [addMember, { isLoading: isAdding }] = useAddTeamMemberMutation()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<AssignMemberFormValues>({
    resolver: useZodResolverIntl(assignMemberSchema, projectValidationMessages),
    defaultValues: INITIAL_FORM,
    mode: 'onChange',
  })

  const availableMembers = useMemo(
    () => orgMembers.filter((mem) => !existingMemberUserIds.has(mem.userId)),
    [orgMembers, existingMemberUserIds],
  )

  useEffect(() => {
    if (!open) reset(INITIAL_FORM)
  }, [open, reset])

  const onSubmit = async (data: AssignMemberFormValues) => {
    try {
      await addMember({
        projectId,
        body: { user_id: data.userId.trim() },
      }).unwrap()
      toast.success(intl.formatMessage(m.memberAddSuccess), {
        id: m.memberAddSuccess.id,
      })
      reset(INITIAL_FORM)
      onOpenChange(false)
    } catch {
      toast.error(intl.formatMessage(m.memberAddError), {
        id: m.memberAddError.id,
      })
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset(INITIAL_FORM)
    onOpenChange(next)
  }

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title={intl.formatMessage(m.assignMemberTitle)}
      description={intl.formatMessage(m.assignMemberDescription, {
        project: projectName,
      })}
      onSubmit={handleSubmit(onSubmit)}
      footer={
        <ModalFormFooter
          submitLabel={m.assignMemberSubmit}
          isLoading={isAdding}
          submitDisabled={!isValid || availableMembers.length === 0}
          onCancel={() => handleOpenChange(false)}
        />
      }
    >
      <Stack gap="field">
        <FormField
          htmlFor="member-user-id"
          label={intl.formatMessage(m.userFieldLabel)}
        >
          {isLoadingOrgMembers ? (
            <Skeleton h={10} rounded="md" />
          ) : orgMembersError ? (
            <Text size="sm" color="error">
              {intl.formatMessage(m.orgMembersLoadError)}
            </Text>
          ) : availableMembers.length === 0 ? (
            <Text size="sm" color="muted">
              {intl.formatMessage(m.noAvailableMembers)}
            </Text>
          ) : (
            <>
              <Controller
                control={control}
                name="userId"
                render={({ field }) => (
                  <Combobox
                    id="member-user-id"
                    value={field.value}
                    onValueChange={field.onChange}
                    invalid={!!errors.userId}
                    placeholder={intl.formatMessage(m.selectUserPlaceholder)}
                    options={availableMembers.map((mem) => {
                      const fullName =
                        `${mem.user.firstName} ${mem.user.lastName}`.trim() ||
                        mem.user.email
                      return { value: mem.userId, label: fullName }
                    })}
                  />
                )}
              />
              {errors.userId && (
                <Text size="sm" color="error">
                  {errors.userId.message}
                </Text>
              )}
            </>
          )}
        </FormField>
      </Stack>
    </Modal>
  )
}
