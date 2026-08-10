import { SimpleGrid, Stack } from '@chakra-ui/react'
import { KeyRound, UserRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  Card,
  CardHeading,
  EmptyState,
  Skeleton,
  Text,
  Button,
  Label,
  ReadOnlyField,
} from '@/components'
import { Input } from '@/components/ui/input'
import { useSystemRoleName } from '@/hooks'
import { useZodResolverIntl } from '@/i18n'
import {
  passwordResetSchema,
  authValidationMessages,
  type PasswordResetFormValues,
} from '@/schemas'
import { useGetMeQuery, useResetPasswordMutation } from '@/services/auth'
import { useGetOrganizationQuery } from '@/services/organization'

import { DeleteAccountCard } from './components/delete-account-card'
import { userProfileViewMessages as m } from './user-profile-view-messages'

export function UserProfileView() {
  const intl = useIntl()
  const { data: user, isLoading } = useGetMeQuery()
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation()

  const { data: organization } = useGetOrganizationQuery(
    user?.organizationId ?? '',
    { skip: !user?.organizationId },
  )
  // The backend's `role.name` is English reference data, not copy.
  const roleName = useSystemRoleName()(user?.roleId)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordResetFormValues>({
    resolver: useZodResolverIntl(passwordResetSchema, authValidationMessages),
    defaultValues: { password: '' },
  })

  const handleResetPassword = async (data: PasswordResetFormValues) => {
    try {
      await resetPassword({ password: data.password }).unwrap()
      toast.success(intl.formatMessage(m.passwordUpdatedToast), {
        id: m.passwordUpdatedToast.id,
      })
      reset()
    } catch {
      toast.error(intl.formatMessage(m.passwordUpdateErrorToast), {
        id: m.passwordUpdateErrorToast.id,
      })
    }
  }

  if (isLoading) {
    return (
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="block" aria-hidden>
        {Array.from({ length: 2 }).map((_, card) => (
          <Card key={card}>
            <Skeleton h={5} w="45%" />
            <Stack gap="tight">
              {Array.from({ length: 4 }).map((_, line) => (
                <Skeleton key={line} h={10} rounded="md" />
              ))}
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    )
  }

  if (!user) {
    return (
      <EmptyState icon={UserRound} title={intl.formatMessage(m.loadError)} />
    )
  }

  return (
    // Two columns from `lg` — profile data on the left, the actions that
    // change the account on the right.
    <SimpleGrid
      columns={{ base: 1, lg: 2 }}
      gap="block"
      css={{ '& > *': { height: '100%' } }}
    >
      {/* User Info */}
      <Card
        header={
          <CardHeading
            icon={UserRound}
            title={<FormattedMessage {...m.personalInfo} />}
            description={<FormattedMessage {...m.personalInfoDescription} />}
          />
        }
        contentProps={{ display: 'flex', flexDirection: 'column', gap: 4 }}
      >
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
          <ReadOnlyField label={intl.formatMessage(m.firstName)}>
            {user.firstName}
          </ReadOnlyField>
          <ReadOnlyField label={intl.formatMessage(m.lastName)}>
            {user.lastName}
          </ReadOnlyField>
        </SimpleGrid>
        <ReadOnlyField label={intl.formatMessage(m.email)}>
          {user.email}
        </ReadOnlyField>
        <ReadOnlyField label={intl.formatMessage(m.phone)}>
          {user.phone ?? intl.formatMessage(m.phoneNotRegistered)}
        </ReadOnlyField>
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
          <ReadOnlyField label={intl.formatMessage(m.role)}>
            {roleName ?? '—'}
          </ReadOnlyField>
          <ReadOnlyField label={intl.formatMessage(m.status)}>
            {intl.formatMessage(user.isActive ? m.active : m.inactive)}
          </ReadOnlyField>
        </SimpleGrid>
      </Card>

      {/* The two actions that change the account, stacked in one column. */}
      <Stack gap="section" css={{ '& > *': { flex: 1 } }}>
        <Card
          header={
            <CardHeading
              icon={KeyRound}
              title={<FormattedMessage {...m.changePassword} />}
              description={
                <FormattedMessage {...m.changePasswordDescription} />
              }
            />
          }
        >
          <form
            onSubmit={handleSubmit(handleResetPassword)}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <Stack gap={2}>
              <Label htmlFor="new-password">
                <FormattedMessage {...m.newPasswordLabel} />
              </Label>
              <Input
                id="new-password"
                type="password"
                placeholder={intl.formatMessage(m.newPasswordPlaceholder)}
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              {errors.password && (
                <Text size="sm" color="error">
                  {errors.password.message}
                </Text>
              )}
            </Stack>
            <Button type="submit" alignSelf="flex-start" disabled={isResetting}>
              {isResetting ? (
                <FormattedMessage {...m.updating} />
              ) : (
                <FormattedMessage {...m.updatePassword} />
              )}
            </Button>
          </form>
        </Card>

        {/* Danger zone — account deletion, with the owner fork */}
        <DeleteAccountCard
          ownedOrganization={
            organization && organization.ownerId === user.userId
              ? organization
              : null
          }
        />
      </Stack>
    </SimpleGrid>
  )
}
