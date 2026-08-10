import { Box, Flex, Stack } from '@chakra-ui/react'
import { AlertTriangle, ChevronDown, ChevronUp, User } from 'lucide-react'
import { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router'

import { Button, DetailShell, EmptyState, Text } from '@/components'
import { ForceStart } from '@/features'
import { usePermission } from '@/hooks'
import {
  TASK_PANEL_PARAM,
  TASK_SUBTASK_PARAM,
  buildTaskDetailPath,
  buildProjectDetailPath,
  resolveTaskPanel,
  type TaskPanelTab,
} from '@/router'
import { useGetSubtaskQuery, useGetTaskQuery } from '@/services/task'
import { isTaskBlocked } from '@/utils'

import {
  TaskPanel,
  TaskActions,
  TaskHeaderBadges,
  TaskHeaderVitals,
  TaskOverviewTab,
} from './components'
import { taskDetailHeaderMessages } from './components/task-detail-header/task-detail-header-messages'
import { TaskHeaderDelayAlert } from './components/task-detail-header/task-header-delay-alert'
import { taskDetailViewMessages as m } from './task-detail-view-messages'

/**
 * The activity's own page, inside its project's flow.
 *
 * The address always carries the PARENT activity; a subactivity rides as
 * `?subtask=` and lands the page on the subactivities section with that
 * row's card selected. A subactivity id that arrives in the path — an old
 * link, a history entry — is canonicalized into that form with a redirect,
 * so every way in ends at the same address.
 *
 * The project stays present through the topbar trail (Projects → project →
 * Activities → this page), which is also the way back. The header card holds
 * everything general about the activity — identity, state, dates and
 * durations — so no section has to be opened to read it; on a phone the dates
 * and the delay note fold behind one toggle so the subactivity list stays
 * within reach.
 */
export function TaskDetailView() {
  const intl = useIntl()
  const navigate = useNavigate()
  const { projectId = '', taskId = '' } = useParams<{
    projectId: string
    taskId: string
  }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const canViewBudget = usePermission('task.tabs.budget.view')
  const [showDetail, setShowDetail] = useState(false)

  const {
    data: task,
    isLoading: taskLoading,
    error: taskError,
  } = useGetTaskQuery(taskId)
  // `GET /v1/tasks/{id}` answers 404 for a subactivity id: resolve the row
  // to its parent so the canonical address can be issued below.
  // `currentData`, not `data`: after the redirect this hook is skipped, and
  // `data` would keep serving the stray row — re-firing the redirect forever.
  const { currentData: straySubactivity, isLoading: strayLoading } =
    useGetSubtaskQuery(taskId, { skip: !taskError })

  const subtaskId = searchParams.get(TASK_SUBTASK_PARAM)
  const { tab } = resolveTaskPanel(searchParams.get(TASK_PANEL_PARAM), {
    canViewBudget,
  })

  const changeTab = (next: TaskPanelTab) => {
    const params = new URLSearchParams(searchParams)
    params.set(TASK_PANEL_PARAM, next)
    setSearchParams(params, { replace: true })
  }

  // The path named a subactivity: redirect to its parent's address with the
  // row riding as `?subtask=` — one canonical URL per row.
  if (straySubactivity) {
    return (
      <Navigate
        to={buildTaskDetailPath(projectId, straySubactivity.parentId, {
          subtaskId: taskId,
          section: tab ?? undefined,
        })}
        replace
      />
    )
  }

  if (taskLoading || (taskError && strayLoading)) {
    return <DetailShell isLoading />
  }

  if (!task) {
    return (
      <Stack gap="block" px="gutter" py="gutterY">
        <EmptyState
          icon={AlertTriangle}
          title={intl.formatMessage(m.errorTitle)}
          description={intl.formatMessage(m.errorBody)}
        />
      </Stack>
    )
  }

  return (
    <DetailShell
      description={task.description}
      meta={
        task.assigneeName && (
          <Flex align="center" gap={1.5}>
            <Box as={User} boxSize={4} color="fg.muted" />
            <Text size="sm" color="muted">
              <FormattedMessage
                {...taskDetailHeaderMessages.assigneePrefix}
                values={{ name: task.assigneeName }}
              />
            </Text>
          </Flex>
        )
      }
      badges={<TaskHeaderBadges task={task} />}
      actions={
        <Flex align="center" gap={2}>
          {isTaskBlocked(task) && (
            <ForceStart target="task" id={task.id} name={task.title} />
          )}
          <TaskActions
            task={task}
            onDeleted={async () => navigate(buildProjectDetailPath(projectId))}
          />
        </Flex>
      }
      headerExtra={
        <Stack gap={4}>
          <TaskHeaderVitals task={task} />

          {/* On a phone the header stands between the operator and the list
              they came for, so the dates and the delay note fold away — one
              tap, not a scroll. From `md` there is room: everything is open,
              and `order` keeps the desktop reading order it always had. */}
          <Button
            variant="ghost"
            size="sm"
            hideFrom="md"
            alignSelf="flex-start"
            aria-expanded={showDetail}
            onClick={() => setShowDetail(!showDetail)}
          >
            <FormattedMessage {...m.headerDetailToggle} />
            <Box as={showDetail ? ChevronUp : ChevronDown} boxSize={4} />
          </Button>
          <Stack
            gap={4}
            order={{ md: -1 }}
            display={{ base: showDetail ? 'flex' : 'none', md: 'flex' }}
          >
            <TaskOverviewTab task={task} />
            <TaskHeaderDelayAlert task={task} />
          </Stack>
        </Stack>
      }
    >
      <TaskPanel
        task={task}
        subtaskId={subtaskId}
        tab={tab}
        onTabChange={changeTab}
      />
    </DetailShell>
  )
}
