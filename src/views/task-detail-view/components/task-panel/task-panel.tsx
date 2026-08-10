import { Stack } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useIntl } from 'react-intl'

import { Badge, Heading, Tabs, type TabItem } from '@/components'
import { TaskDependencies } from '@/features/dependency-edits/components/task-dependencies/task-dependencies'
import { usePermission } from '@/hooks'
import { TASK_PANEL_TABS, type TaskPanelTab } from '@/router'
import { useGetDependencyChainsQuery } from '@/services/task'
import type { Task } from '@/types'

import { taskDetailViewMessages as m } from '../../task-detail-view-messages'
import { SubtaskPanel } from '../subtask-panel'
import { TaskBudgetTab } from '../task-budget-tab'
import { TaskExpensesTab } from '../task-expenses-tab'

export interface TaskPanelProps {
  /** The phase whose page this is — the address always carries the parent. */
  task: Task
  /** The subactivity the URL selects (`?subtask=`), if any. */
  subtaskId?: string | null
  /**
   * The section the URL names, or `null` for the default: the subactivity
   * list — the daily work of the page's heaviest user.
   */
  tab: TaskPanelTab | null
  onTabChange: (tab: TaskPanelTab) => void
}

const SECTION_LABEL: Record<TaskPanelTab, keyof typeof m> = {
  dependencies: 'tabDependencies',
  subtasks: 'tabSubtasks',
  budget: 'tabBudget',
}

// The section buttons read as pills, not the default tab line — the one look
/**
 * The activity page's content: one section at a time, under section buttons
 * that carry their counts — the short answer of each section, readable
 * without opening it. The identity and state above it belong to the page
 * header (`DetailShell` + `TaskHeaderVitals`), not here.
 */
export function TaskPanel({
  task,
  subtaskId = null,
  tab,
  onTabChange,
}: TaskPanelProps) {
  const intl = useIntl()
  const canViewBudget = usePermission('task.tabs.budget.view')

  const subactivity = task.subtasks?.find((row) => row.id === subtaskId) ?? null

  // The selected row's own edge count — same scope rule as the dependencies
  // section: the links of the row the URL selects, at its own level. The
  // query is already in flight for the header's blocker note.
  const { data: chains } = useGetDependencyChainsQuery(task.projectId)
  const rowId = subactivity?.id ?? task.id
  const dependencyCount = useMemo(() => {
    const all = chains
      ? [...chains.interPhase, ...Object.values(chains.intraPhase).flat()]
      : []
    return all.filter(
      (edge) => edge.task.id === rowId || edge.dependsOn?.id === rowId,
    ).length
  }, [chains, rowId])

  // No explicit section in the URL: the subactivity list is the default —
  // the daily work. Everything "general" reads from the page header.
  const activeTab: TaskPanelTab = tab ?? 'subtasks'

  const visible = TASK_PANEL_TABS.filter(
    (section) => section !== 'budget' || canViewBudget,
  )

  const sectionCount: Partial<Record<TaskPanelTab, number>> = {
    dependencies: dependencyCount,
    subtasks: task.subtasks?.length ?? 0,
  }

  const sectionContent: Record<TaskPanelTab, TabItem['content']> = {
    dependencies: (
      <Stack
        as="section"
        gap="tight"
        data-testid="activity-section-dependencies"
      >
        <Heading size="h4" color="primary">
          {intl.formatMessage(m[SECTION_LABEL.dependencies])}
        </Heading>
        <TaskDependencies
          projectId={task.projectId}
          taskId={rowId}
          taskTitle={subactivity?.title ?? task.title}
          level={subactivity ? 'subtask' : 'task'}
        />
      </Stack>
    ),
    // No heading: the list titles itself with its count. The panel reads
    // `?subtask=` off the URL itself — as a filter and as the row to open.
    subtasks: (
      <Stack as="section" gap="tight" data-testid="activity-section-subtasks">
        <SubtaskPanel
          taskId={task.id}
          taskTitle={task.title}
          projectId={task.projectId}
        />
      </Stack>
    ),
    budget: (
      <Stack as="section" gap="tight" data-testid="activity-section-budget">
        <Heading size="h4" color="primary">
          {intl.formatMessage(m[SECTION_LABEL.budget])}
        </Heading>
        <Stack gap="section">
          <TaskBudgetTab task={task} />
          <TaskExpensesTab task={task} />
        </Stack>
      </Stack>
    ),
  }

  const items: TabItem[] = visible.map((id) => ({
    value: id,
    label: (
      <>
        {intl.formatMessage(m[SECTION_LABEL[id]])}
        {sectionCount[id] !== undefined && (
          <Badge variant={activeTab === id ? 'complementary' : 'gray'}>
            {sectionCount[id]}
          </Badge>
        )}
      </>
    ),
    content: sectionContent[id],
  }))

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as TaskPanelTab)}
      items={items}
      display="flex"
      flexDirection="column"
      gap={6}
      data-testid="task-panel"
      lazyMount
      unmountOnExit
      listProps={{ 'aria-label': intl.formatMessage(m.sectionNav) }}
    />
  )
}
