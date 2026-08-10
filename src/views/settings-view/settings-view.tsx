import { Stack } from '@chakra-ui/react'
import { FormattedMessage } from 'react-intl'

import { Heading } from '@/components'
import { usePermission } from '@/hooks'
import { OrganizationSettingsView } from '@/views/organization-settings-view'
import { organizationSettingsViewMessages } from '@/views/organization-settings-view/organization-settings-view-messages'
import { UserProfileView } from '@/views/user-profile-view'
import { userProfileViewMessages } from '@/views/user-profile-view/user-profile-view-messages'

/**
 * One settings home: the account and the organization are sections, not two
 * half-a-screen routes under the same menu group. The organization block only
 * exists for whoever may change it — the route itself is open, because
 * everyone has an account.
 */
export function SettingsView() {
  const canManageOrganization = usePermission('organization.settings.manage')

  return (
    <Stack gap="section" px="gutter" py="gutterY" maxW="6xl" w="full">
      <Stack gap="block">
        <Heading as="h2" fontSize="xl" fontWeight="bold">
          <FormattedMessage {...userProfileViewMessages.title} />
        </Heading>
        <UserProfileView />
      </Stack>

      {canManageOrganization && (
        <Stack gap="block">
          <Heading as="h2" fontSize="xl" fontWeight="bold">
            <FormattedMessage {...organizationSettingsViewMessages.title} />
          </Heading>
          <OrganizationSettingsView />
        </Stack>
      )}
    </Stack>
  )
}
