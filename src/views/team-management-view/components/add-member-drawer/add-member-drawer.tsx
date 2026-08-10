import { SimpleGrid, Stack } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { FormattedMessage, useIntl } from 'react-intl'

import { Modal, FormField, ModalFormFooter, Text } from '@/components'
import { Input } from '@/components/ui/input'
import { useZodResolverIntl } from '@/i18n'
import {
  teamMemberCreateSchema,
  teamMemberValidationMessages,
  type TeamMemberCreateFormValues,
} from '@/schemas'

import { teamManagementViewMessages } from '../../team-management-view-messages'

const INITIAL_FORM: TeamMemberCreateFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  // The API has always required a role and has always accepted `admin`; the
  // client just never asked, so everybody landed here.
  role: 'member',
}

interface AddMemberDrawerProps {
  open: boolean
  isSubmitting: boolean
  onOpenChange: (next: boolean) => void
  /** Resolves true when the member was created — the form then resets. */
  onCreate: (data: TeamMemberCreateFormValues) => Promise<boolean>
}

export function AddMemberDrawer({
  open,
  isSubmitting,
  onOpenChange,
  onCreate,
}: AddMemberDrawerProps) {
  const intl = useIntl()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<TeamMemberCreateFormValues>({
    resolver: useZodResolverIntl(
      teamMemberCreateSchema,
      teamMemberValidationMessages,
    ),
    defaultValues: INITIAL_FORM,
    mode: 'onChange',
  })

  const handleOpenChange = (next: boolean) => {
    if (!next) reset(INITIAL_FORM)
    onOpenChange(next)
  }

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title={intl.formatMessage(teamManagementViewMessages.addMember)}
      description={intl.formatMessage(
        teamManagementViewMessages.addMemberDialogDescription,
      )}
      onSubmit={handleSubmit(async (data) => {
        if (await onCreate(data)) reset(INITIAL_FORM)
      })}
      footer={
        <ModalFormFooter
          submitLabel={teamManagementViewMessages.createMemberButton}
          isLoading={isSubmitting}
          submitDisabled={!isValid}
          onCancel={() => handleOpenChange(false)}
        />
      }
    >
      <Stack gap="field">
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap="tight">
          <FormField
            htmlFor="member-first-name"
            label={
              <FormattedMessage
                {...teamManagementViewMessages.firstNameLabel}
              />
            }
            error={errors.firstName?.message}
          >
            <Input
              id="member-first-name"
              placeholder={intl.formatMessage(
                teamManagementViewMessages.firstNamePlaceholder,
              )}
              autoComplete="given-name"
              aria-invalid={!!errors.firstName}
              {...register('firstName')}
            />
          </FormField>
          <FormField
            htmlFor="member-last-name"
            label={
              <FormattedMessage {...teamManagementViewMessages.lastNameLabel} />
            }
            error={errors.lastName?.message}
          >
            <Input
              id="member-last-name"
              placeholder={intl.formatMessage(
                teamManagementViewMessages.lastNamePlaceholder,
              )}
              autoComplete="family-name"
              aria-invalid={!!errors.lastName}
              {...register('lastName')}
            />
          </FormField>
        </SimpleGrid>

        <FormField
          htmlFor="member-email"
          label={
            <FormattedMessage {...teamManagementViewMessages.emailLabel} />
          }
          error={errors.email?.message}
        >
          <Input
            id="member-email"
            type="email"
            placeholder={intl.formatMessage(
              teamManagementViewMessages.emailPlaceholder,
            )}
            autoComplete="off"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
        </FormField>

        {/* No role picker here. A new teammate starts as a `user` — the
            backend assigns the default role — and is granted a role
            afterwards, from the row's own control. */}
        <Text size="xs" color="muted">
          <FormattedMessage {...teamManagementViewMessages.roleHint} />
        </Text>

        <Text size="xs" color="muted">
          <FormattedMessage {...teamManagementViewMessages.tempPasswordHint} />
        </Text>
      </Stack>
    </Modal>
  )
}
