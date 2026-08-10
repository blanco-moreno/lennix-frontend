import { Box, Flex } from '@chakra-ui/react'
import {
  DollarSign,
  Users,
  GanttChartSquare,
  History,
  AlertTriangle,
  MapPin,
  User,
} from 'lucide-react'
import { FormattedMessage } from 'react-intl'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router'

import { Badge, DetailShell, StatusBadge, Text } from '@/components'
import { Tabs, type TabItem } from '@/components'
import { usePermission, usePriorityLabel } from '@/hooks'
import {
  TASK_PANEL_PARAM,
  TASK_PANEL_TABS,
  PROJECT_TAB_PARAM,
  buildTaskDetailPath,
  resolveProjectTab,
} from '@/router'
import { useGetProjectQuery } from '@/services/project'
import { getPriorityColor } from '@/utils'

import {
  ProjectActions,
  projectActionsMessages,
} from './components/project-actions'
import { ProjectBudgetTab } from './components/project-budget-tab'
import { ProjectHistory } from './components/project-history'
import {
  ScheduleSurface,
  type ScheduleRow,
} from './components/project-schedule'
import { ProjectSummaryStrip } from './components/project-summary-strip'
import { ProjectTeamPanel } from './components/project-team-panel'
import { RiskRegister } from './components/risk-register'
import { projectDetailViewMessages as m } from './project-detail-view-messages'

export function ProjectDetailView() {
  const navigate = useNavigate()
  const priorityLabel = usePriorityLabel()
  const { projectId } = useParams<{ projectId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const canViewBudget = usePermission('project.tabs.budget.view')
  const canViewRisks = usePermission('project.tabs.risks.view')

  // The open tab lives in the URL, not in component state: a tab is a link.
  const activeView = resolveProjectTab(searchParams.get(PROJECT_TAB_PARAM), {
    canViewBudget,
    canViewRisks,
  })

  const handleTabChange = (value: string) => {
    const next = new URLSearchParams(searchParams)
    next.set(PROJECT_TAB_PARAM, value)
    setSearchParams(next, { replace: true })
  }

  const {
    data: project,
    isLoading,
    error,
  } = useGetProjectQuery(projectId || '1')

  // The drawer-era address: `?activity=<id>&panel=<section>`. The task is
  // a page now, so the old links redirect there, section preserved. Only
  // `panel` triggers this. The literal `activity` is the OLD drawer link's
  // param and is intentionally NOT the schedule selection param (now `?task=`):
  // old bookmarks keep resolving. Only `?activity=` WITH `?panel=` redirects.
  const legacyActivityId = searchParams.get('activity')
  const legacyPanel = searchParams.get(TASK_PANEL_PARAM)
  if (projectId && legacyActivityId && legacyPanel !== null) {
    const known = (TASK_PANEL_TABS as readonly string[]).includes(legacyPanel)
    return (
      <Navigate
        to={buildTaskDetailPath(projectId, legacyActivityId, {
          section: known ? legacyPanel : undefined,
        })}
        replace
      />
    )
  }

  if (isLoading) {
    return <DetailShell isLoading />
  }

  if (error || !project) {
    return (
      <Box px="gutter" py="gutterY">
        <FormattedMessage {...m.loadError} />
      </Box>
    )
  }

  // Opening a row is a navigation now: the activity has a page of its own.
  // The address always carries the parent; a subactivity rides as a query
  // param and lands the page on the subactivities section, card selected.
  const handleOpenRow = (row: ScheduleRow) => {
    navigate(
      buildTaskDetailPath(project.id, row.parentId ?? row.id, {
        subtaskId: row.parentId ? row.id : undefined,
      }),
    )
  }

  const tabItems: TabItem[] = [
    {
      // The schedule is the project home; the KPI/progress strip sits above
      // the timeline.
      value: 'schedule',
      label: (
        <>
          <Box as={GanttChartSquare} boxSize={4} />
          <FormattedMessage {...m.tabSchedule} />
        </>
      ),
      content: (
        <Box>
          <ScheduleSurface projectId={project.id} onOpenRow={handleOpenRow} />
        </Box>
      ),
    },
    ...(canViewBudget
      ? [
          {
            value: 'budget',
            label: (
              <>
                <Box as={DollarSign} boxSize={4} />
                <FormattedMessage {...m.tabBudget} />
              </>
            ),
            content: <ProjectBudgetTab projectId={project.id} />,
          } satisfies TabItem,
        ]
      : []),
    {
      value: 'team',
      label: (
        <>
          <Box as={Users} boxSize={4} />
          <FormattedMessage {...m.tabTeam} />
        </>
      ),
      content: (
        <ProjectTeamPanel
          projectId={project.id}
          projectName={project.name}
          organizationId={project.organizationId}
        />
      ),
    },
    ...(canViewRisks
      ? [
          {
            value: 'risks',
            label: (
              <>
                <Box as={AlertTriangle} boxSize={4} />
                <FormattedMessage {...m.tabRisks} />
              </>
            ),
            content: (
              <RiskRegister projectId={project.id} projectName={project.name} />
            ),
          } satisfies TabItem,
        ]
      : []),
    {
      // "Historial", never "Activity": in AEC an *actividad* is a task,
      // so the word is already taken by the schedule.
      value: 'history',
      label: (
        <>
          <Box as={History} boxSize={4} />
          <FormattedMessage {...m.tabHistory} />
        </>
      ),
      content: <ProjectHistory projectId={project.id} />,
    },
  ]

  return (
    <DetailShell
      description={project.description}
      meta={
        <>
          {/* Identity, not KPIs: who runs it and where it is. Progress,
              budget and dates are not repeated here — they live in the
              progress section, the Budget tab and the schedule. */}
          {project.managerName && (
            <Flex align="center" gap={1.5}>
              <Box as={User} boxSize={4} color="fg.muted" />
              <Text size="sm" color="muted">
                <FormattedMessage {...projectActionsMessages.managerPrefix} />
                {project.managerName}
              </Text>
            </Flex>
          )}
          {project.location && (
            <Flex align="center" gap={1.5}>
              <Box as={MapPin} boxSize={4} color="fg.muted" />
              <Text size="sm" color="muted">
                {project.location}
              </Text>
            </Flex>
          )}
        </>
      }
      badges={
        <>
          {/* The verdict, identical to the one `/projects` and the home paint —
              the detail no longer reaches its own conclusion from `status`. */}
          <StatusBadge domain="health" value={project.health.level} />
          <Badge {...getPriorityColor(project.priority)}>
            <FormattedMessage {...projectActionsMessages.priorityPrefix} />
            {priorityLabel(project.priority)}
          </Badge>
        </>
      }
      actions={<ProjectActions project={project} />}
      headerExtra={
        // The project's general information — the four KPIs and the overall
        // progress with its dates — reads from the header, whatever tab is
        // open below.
        <ProjectSummaryStrip project={project} />
      }
    >
      <Tabs
        value={activeView}
        onValueChange={handleTabChange}
        w="full"
        items={tabItems}
      />
    </DetailShell>
  )
}
