import { FormattedMessage } from 'react-intl'

import { Text } from '@/components'

import { tasksViewMessages } from '../../tasks-view-messages'

// No create action here: an activity is created inside its project's schedule.
export function TaskDashboardHeader() {
  return (
    <Text size="lg" color="muted">
      <FormattedMessage {...tasksViewMessages.subtitle} />
    </Text>
  )
}
