import { Box, Flex, SimpleGrid, Stack } from '@chakra-ui/react'
import { Building2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  Badge,
  Button,
  Card,
  CardHeading,
  Heading,
  Label,
  ReadOnlyField,
  Text,
} from '@/components'
import { Input } from '@/components/ui/input'
import { useZodResolverIntl } from '@/i18n'
import {
  orgCreateSchema,
  orgValidationMessages,
  type OrgCreateFormValues,
} from '@/schemas'
import { useGetMeQuery } from '@/services/auth'
import {
  useGetOrganizationQuery,
  useCreateOrganizationMutation,
  useListOrganizationsQuery,
} from '@/services/organization'

import { TransferOwnershipCard } from './components/transfer-ownership-card'
import { organizationSettingsViewMessages as m } from './organization-settings-view-messages'

export function OrganizationSettingsView() {
  const intl = useIntl()
  const { data: user, isLoading: isUserLoading } = useGetMeQuery()
  const organizationId = user?.organizationId ?? ''

  const { data: organization, isLoading: isOrgLoading } =
    useGetOrganizationQuery(organizationId, { skip: !organizationId })

  useListOrganizationsQuery(undefined, { skip: !user })

  const [createOrganization, { isLoading: isCreating }] =
    useCreateOrganizationMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<OrgCreateFormValues>({
    resolver: useZodResolverIntl(orgCreateSchema, orgValidationMessages),
    defaultValues: { name: '', slug: '' },
    mode: 'onChange',
  })

  const handleCreateOrg = async (data: OrgCreateFormValues) => {
    try {
      await createOrganization({
        name: data.name.trim(),
        slug: data.slug.trim(),
      }).unwrap()
      toast.success(intl.formatMessage(m.createSuccessToast), {
        id: m.createSuccessToast.id,
      })
      reset()
    } catch {
      toast.error(intl.formatMessage(m.createErrorToast), {
        id: m.createErrorToast.id,
      })
    }
  }

  if (isUserLoading || isOrgLoading) {
    return (
      <Flex align="center" justify="center" py={12} gap={2}>
        <Text color="muted">
          <FormattedMessage {...m.loading} />
        </Text>
      </Flex>
    )
  }

  // No org — show creation form
  if (!organizationId || !organization) {
    return (
      // A single-column form: it keeps its reading measure, centred, and only
      // the page padding follows the screen.
      <Stack gap="block" mx="auto" maxW="md" w="full">
        <Heading as="h2" fontSize="xl" fontWeight="bold">
          <FormattedMessage {...m.createTitle} />
        </Heading>
        <Card
          header={
            <>
              <Box as="h4" lineHeight="1">
                <FormattedMessage {...m.newOrgCardTitle} />
              </Box>
              <Box as="p" color="fg.muted">
                <FormattedMessage {...m.newOrgCardDescription} />
              </Box>
            </>
          }
        >
          <form
            onSubmit={handleSubmit(handleCreateOrg)}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <Stack gap={2}>
              <Label htmlFor="org-name">
                <FormattedMessage {...m.nameLabel} />
              </Label>
              <Input
                id="org-name"
                placeholder={intl.formatMessage(m.namePlaceholder)}
                aria-invalid={!!errors.name}
                {...register('name')}
              />
              {errors.name && (
                <Text size="sm" color="error">
                  {errors.name.message}
                </Text>
              )}
            </Stack>
            <Stack gap={2}>
              <Label htmlFor="org-slug">
                <FormattedMessage {...m.slugLabel} />
              </Label>
              <Input
                id="org-slug"
                placeholder={intl.formatMessage(m.slugPlaceholder)}
                aria-invalid={!!errors.slug}
                {...register('slug')}
              />
              <Text size="sm" color="muted">
                <FormattedMessage {...m.slugDescription} />
              </Text>
              {errors.slug && (
                <Text size="sm" color="error">
                  {errors.slug.message}
                </Text>
              )}
            </Stack>
            <Button type="submit" disabled={!isValid || isCreating}>
              {isCreating ? (
                <FormattedMessage {...m.creating} />
              ) : (
                <FormattedMessage {...m.createTitle} />
              )}
            </Button>
          </form>
        </Card>
      </Stack>
    )
  }

  const limits = organization.resolvedLimits
  const isPendingEnterprise = limits.pendingEnterpriseConfiguration
  const isOwner = user?.userId === organization.ownerId

  const formatLimit = (value: number | null, suffix = ''): string => {
    if (value === null) return intl.formatMessage(m.unlimited)
    return suffix ? `${value} ${suffix}` : String(value)
  }

  return (
    // Who the organization is and what it is entitled to are one fact, so
    // they are one card; the owner handover sits beside it.
    <SimpleGrid
      columns={{ base: 1, lg: 2 }}
      gap="block"
      css={{ '& > *': { height: '100%' } }}
    >
      <Card
        header={
          <CardHeading
            icon={Building2}
            title={<FormattedMessage {...m.nameCardTitle} />}
            description={<FormattedMessage {...m.nameCardDescription} />}
          />
        }
        contentProps={{ css: { '& > * + *': { mt: 3 } } }}
      >
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
          <ReadOnlyField label={intl.formatMessage(m.nameLabel)}>
            {organization.name}
          </ReadOnlyField>
          <ReadOnlyField label={intl.formatMessage(m.planLabel)}>
            <Flex align="center" gap="tight" wrap="wrap">
              <Badge variant="secondary">{organization.plan.name}</Badge>
              {limits.source === 'enterprise_terms' && (
                <Badge variant="complementary">
                  <FormattedMessage {...m.customPlanBadge} />
                </Badge>
              )}
            </Flex>
          </ReadOnlyField>

          {/* An enterprise plan still being configured has no limits yet. */}
          {!isPendingEnterprise && (
            <>
              <ReadOnlyField label={intl.formatMessage(m.maxTeamSize)}>
                {formatLimit(limits.maxTeamSize)}
              </ReadOnlyField>
              <ReadOnlyField label={intl.formatMessage(m.maxProjects)}>
                {formatLimit(limits.maxProjects)}
              </ReadOnlyField>
              <ReadOnlyField label={intl.formatMessage(m.storage)}>
                {formatLimit(limits.storageMb, 'MB')}
              </ReadOnlyField>
              <ReadOnlyField label={intl.formatMessage(m.aiRequests)}>
                {limits.aiRequests}
              </ReadOnlyField>
            </>
          )}
        </SimpleGrid>

        {isPendingEnterprise && (
          <Text color="muted" size="sm">
            <FormattedMessage {...m.pendingEnterprise} />
          </Text>
        )}
      </Card>

      {isOwner && <TransferOwnershipCard organization={organization} />}
    </SimpleGrid>
  )
}
