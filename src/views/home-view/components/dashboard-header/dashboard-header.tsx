/**
 * The page's lead line. The topbar owns the title, so all this adds is what
 * the page is *for* — no timestamp: "Updated: <now>" was rendered from the
 * browser clock, so it said nothing about the data.
 *
 * The only role-aware bit on this screen: without `project.list.viewAll` the
 * backend already narrows every aggregate to the obras the user belongs to, so
 * there is no conditional data — just a line that names the scope.
 */

import { FormattedMessage } from 'react-intl'

import { Text } from '@/components'
import { usePermission } from '@/hooks'

import { homeViewMessages } from '../../home-view-messages'

export function DashboardHeader() {
  const seesWholeOrganization = usePermission('project.list.viewAll')

  return (
    <Text size="lg" color="muted" maxW="3xl">
      <FormattedMessage
        {...(seesWholeOrganization
          ? homeViewMessages.subtitle
          : homeViewMessages.subtitleScoped)}
      />
    </Text>
  )
}
