/**
 * ONE schedule surface: the Gantt *is* the task list and the dependency graph
 * is edited on it. There are no critical-path or delay views beside it — the
 * chart's own filters already narrow to exactly those rows, so a second way to
 * read the same subset was a tab that answered a question already answered.
 * Risks keeps only what is genuinely risk analysis.
 *
 * Everything shown here is the backend's on-read derivation. The surface
 * queries, filters and paints it — it never recomputes it.
 */

import { Flex, Stack } from '@chakra-ui/react'
import { useCallback, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'

import {
  Badge,
  Card,
  FormDrawer,
  Heading,
  Skeleton,
  Text,
  ToggleButton,
} from '@/components'
import {
  buildScheduleRows,
  collapseRows,
  filterRows,
  GanttZoom,
  SCHEDULE_FILTERS,
  SelectionPanel,
  useScheduleSelection,
  ZOOM_DAY_WIDTH,
  type ScheduleFilter,
  type ScheduleRow,
  type ZoomLevel,
} from '@/features'
import { ScheduleExportButton } from '@/features'
import { TaskDependencies } from '@/features/dependency-edits/components/task-dependencies/task-dependencies'
import { ScheduleGantt } from '@/features/schedule-gantt/schedule-gantt'
import {
  useGetDependencyChainsQuery,
  useListProjectTasksQuery,
} from '@/services/task'
import type { DependencyNode } from '@/types'

import { BrokenDependency } from '../broken-dependency'
import { useParentAutoCompleteToast } from '../hooks/use-parent-auto-complete-toast'

import { FILTER_LABEL } from './constants'
import { useEdgeActions } from './hooks/use-edge-actions'
import { scheduleSurfaceMessages as m } from './schedule-surface-messages'

export interface ScheduleSurfaceProps {
  projectId: string
  /**
   * Opens a row elsewhere (task detail) — the schedule stays the spine.
   *
   * Takes the row, not its id: where a row opens depends on its level, and
   * the schedule is the only side that knows a row's level. An id alone would
   * send a subactivity to the phase address.
   */
  onOpenRow?: (row: ScheduleRow) => void
}

export function ScheduleSurface({
  projectId,
  onOpenRow,
}: ScheduleSurfaceProps) {
  const intl = useIntl()
  const [filter, setFilter] = useState<ScheduleFilter>('all')
  // Week: a schedule is read by the week; the chart scrolls horizontally at
  // every width and opens on today.
  const [zoom, setZoom] = useState<ZoomLevel>('week')
  const [dependenciesOpen, setDependenciesOpen] = useState(false)
  const [collapsedIds, setCollapsedIds] = useState<ReadonlySet<string>>(
    new Set(),
  )

  const toggleCollapse = useCallback((rowId: string) => {
    setCollapsedIds((current) => {
      const next = new Set(current)
      if (next.has(rowId)) next.delete(rowId)
      else next.add(rowId)
      return next
    })
  }, [])

  const { data: tasks = [], isLoading } = useListProjectTasksQuery(projectId)
  const { data: chains } = useGetDependencyChainsQuery(projectId)

  // The backend completes a phase when its last activity is done; the
  // user should hear it from us, not notice it later.
  useParentAutoCompleteToast(tasks)

  const rows = useMemo(() => buildScheduleRows(tasks), [tasks])
  const edges = useMemo<DependencyNode[]>(
    () =>
      chains
        ? [...chains.interPhase, ...Object.values(chains.intraPhase).flat()]
        : [],
    [chains],
  )

  const visibleRows = useMemo(
    () => collapseRows(filterRows(rows, filter), collapsedIds),
    [rows, filter, collapsedIds],
  )

  // Filtering and collapsing hide rows, and with them their arrows — count
  // what the current view is not drawing, so nothing disappears silently.
  const hiddenEdgeCount = useMemo(() => {
    const visibleIds = new Set(visibleRows.map((row) => row.id))
    return edges.filter(
      (edge) =>
        !edge.isBroken &&
        edge.dependsOn !== null &&
        (!visibleIds.has(edge.task.id) || !visibleIds.has(edge.dependsOn.id)),
    ).length
  }, [edges, visibleRows])
  const { isCreating, isRemoving, handleRemoveEdge, handleRelink } =
    useEdgeActions({ projectId })

  const { selectedRowId, selectRow } = useScheduleSelection(rows)

  const broken = edges.filter((edge) => edge.isBroken)
  const selectedRow = rows.find((row) => row.id === selectedRowId) ?? null
  // Only the count survives here: a row's own dependencies are read and edited
  // in its drawer now, beside the dates and the subactivities they explain.
  const selectedEdgeCount = selectedRow
    ? edges.filter(
        (edge) =>
          edge.task.id === selectedRow.id ||
          edge.dependsOn?.id === selectedRow.id,
      ).length
    : 0

  if (isLoading) {
    return (
      <Stack gap={4} data-testid="schedule-surface">
        <Skeleton h={6} w="12rem" />
        <Stack gap={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Flex key={i} align="center" gap={3}>
              <Skeleton h={4} w="14rem" flexShrink={0} />
              <Skeleton
                h={5}
                rounded="full"
                flex="1"
                ml={`${(i % 3) * 8}%`}
                mr={`${((i + 1) % 4) * 10}%`}
              />
            </Flex>
          ))}
        </Stack>
      </Stack>
    )
  }

  return (
    <Stack gap={4} data-testid="schedule-surface">
      <Heading size="h3" color="primary">
        {intl.formatMessage(m.heading)}
      </Heading>

      {/* The KPI row above (project strip) carries the counts now — the one
          badge left is the actionable pathology, and only when it exists. */}
      {broken.length > 0 && (
        <Flex gap={2}>
          <Badge variant="critical">
            {intl.formatMessage(m.kpiBroken, { count: broken.length })}
          </Badge>
        </Flex>
      )}

      {selectedRow && (
        <SelectionPanel
          row={selectedRow}
          dependencyCount={selectedEdgeCount}
          onOpenRow={onOpenRow}
          onShowDependencies={() => setDependenciesOpen(true)}
          onClear={() => selectRow(null)}
        />
      )}

      {/* The graph, edited without leaving the schedule: the drawer holds the
          same chain panel the activity page shows, and every mutation
          invalidates the chains cache — the Gantt behind it repaints live. */}
      {selectedRow && (
        <FormDrawer
          open={dependenciesOpen}
          onOpenChange={setDependenciesOpen}
          size="md"
          title={intl.formatMessage(m.dependenciesDrawerTitle)}
          description={selectedRow.title}
        >
          <TaskDependencies
            projectId={projectId}
            taskId={selectedRow.id}
            taskTitle={selectedRow.title}
            level={selectedRow.level}
            // No chart, no pivot card, no arrows: the drawer opens on top of
            // the full Gantt, which already draws exactly these bars, and its
            // own title already names the row.
            variant="drawer"
          />
        </FormDrawer>
      )}

      <Flex align="center" justify="space-between" gap="tight" wrap="wrap">
        <Flex gap={2} wrap="wrap" data-testid="schedule-filters">
          {SCHEDULE_FILTERS.map((value) => (
            <ToggleButton
              key={value}
              size="sm"
              rounded="full"
              pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {intl.formatMessage(m[FILTER_LABEL[value]])}
            </ToggleButton>
          ))}
        </Flex>

        <Flex align="center" gap="tight" wrap="wrap">
          <GanttZoom value={zoom} onChange={setZoom} />
          <ScheduleExportButton projectId={projectId} />
        </Flex>
      </Flex>

      {hiddenEdgeCount > 0 && (
        <Text size="xs" color="muted" data-testid="hidden-edges-note">
          {intl.formatMessage(m.hiddenEdges, { count: hiddenEdgeCount })}
        </Text>
      )}

      <ScheduleGantt
        rows={visibleRows}
        edges={edges}
        dayWidth={ZOOM_DAY_WIDTH[zoom]}
        selectedRowId={selectedRowId}
        onSelectRow={selectRow}
        collapsedIds={collapsedIds}
        onToggleCollapse={toggleCollapse}
      />

      {/*
        The hint stays down here, where the list it is about lives. Its other
        half — the selected row and its actions — moved to the pinned panel
        above the chart.
      */}
      {!selectedRow && (
        <Card p={4} data-testid="schedule-selection-hint">
          <Text size="xs" color="muted">
            {intl.formatMessage(m.selectedNone)}
          </Text>
        </Card>
      )}

      {/*
        Broken links stay here, and only broken links.

        A healthy edge belongs to a row, and is read in that row's drawer. A
        broken one belongs to nobody: its predecessor is gone, so the fix is
        picking a replacement out of the whole WBS — which only this surface
        holds — and it must be visible without opening every activity in the
        project one by one to find it.
      */}
      {broken.length > 0 && (
        <Stack gap="tight" data-testid="broken-dependencies">
          <Text size="sm" weight="medium" color="primary">
            {intl.formatMessage(m.brokenHeading, { count: broken.length })}
          </Text>
          {broken.map((edge) => (
            <BrokenDependency
              key={edge.id}
              edge={edge}
              rows={rows}
              edges={edges}
              isBusy={isCreating || isRemoving}
              onRelink={handleRelink}
              onDiscard={handleRemoveEdge}
            />
          ))}
        </Stack>
      )}
    </Stack>
  )
}
