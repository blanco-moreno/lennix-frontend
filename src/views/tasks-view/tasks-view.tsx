import { Stack } from '@chakra-ui/react'
import { useIntl } from 'react-intl'
import { useSearchParams } from 'react-router'

import { Tabs, type TabItem } from '@/components'
import { resolveTaskDashboardTab, TASK_DASHBOARD_TAB_PARAM } from '@/router'

import {
  AssignedTabContent,
  ListTabContent,
  TaskDashboardHeader,
} from './components'
import { tasksViewMessages as m } from './tasks-view-messages'

/**
 * The one cross-project activity home, in two tabs: the portfolio list
 * (default) and "assigned to me". Nothing here is permission-gated, and the
 * open tab lives in the URL (`?tab=`) so it survives a reload and can be shared.
 * Creating an activity happens in a project's schedule, not here.
 */
export function TasksView() {
  const intl = useIntl()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeTab = resolveTaskDashboardTab(
    searchParams.get(TASK_DASHBOARD_TAB_PARAM),
  )

  const handleTabChange = (value: string) => {
    const next = new URLSearchParams(searchParams)
    next.set(TASK_DASHBOARD_TAB_PARAM, value)
    setSearchParams(next, { replace: true })
  }

  const items: TabItem[] = [
    {
      value: 'list',
      label: intl.formatMessage(m.tabList),
      content: <ListTabContent />,
    },
    {
      value: 'assigned',
      label: intl.formatMessage(m.tabAssigned),
      content: <AssignedTabContent />,
    },
  ]

  return (
    // Same view rhythm as /projects; the tab panel is the one difference.
    <Stack gap="block" px="gutter" py="gutterY">
      <TaskDashboardHeader />

      {/* Bare tabs on the page — the list's own bottom rule is the divider,
          so the content sits at page level like /projects instead of inside
          a card. `lazyMount`/`unmountOnExit`: the two tabs read two different
          endpoints, so mounting both would make every visit to `/tasks` ask
          the server two questions to answer one. */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        items={items}
        lazyMount
        unmountOnExit
      />
    </Stack>
  )
}
