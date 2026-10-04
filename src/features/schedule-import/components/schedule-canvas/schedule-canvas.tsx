/**
 * The draft's schedule, on the same Gantt and selection grammar project detail
 * uses: the chart reads the activities, their progress and their dependencies
 * at a glance; selecting a row lifts it into the panel, where its actions are.
 *
 * `scope="draft"` throughout — the engine has not run (`IMP-10`), so no status,
 * critical path, delay or block is drawn or stated. Deleting confirms first,
 * in the app's own dialog.
 */

import { Box, Stack } from '@chakra-ui/react'
import { Calendar, CircleHelp, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useIntl } from 'react-intl'

import {
  Badge,
  Button,
  Card,
  commonMessages,
  EmptyState,
  ListToolbar,
  Modal,
  Text,
} from '@/components'
import { usePermission } from '@/hooks'
import { useIntlToast } from '@/i18n'
import { useDeleteReviewRowMutation } from '@/services/schedule-import'
import type { ReviewDependency, ReviewSubtask, ReviewTask } from '@/types'
import { getDestructiveActionTextColor } from '@/utils'

import {
  collapseRows,
  GanttZoom,
  SELECTION_ACTION,
  SelectionPanel,
  useScheduleSelection,
  ZOOM_DAY_WIDTH,
  type ScheduleRow,
  type ZoomLevel,
} from '../../../schedule-gantt'
import { ScheduleGantt } from '../../../schedule-gantt/schedule-gantt'
import { usePhaseFolding } from '../../hooks/use-phase-folding'
import type { RowDrawerTarget } from '../row-drawer'
import {
  buildReviewGanttEdges,
  buildReviewScheduleRows,
} from '../schedule-preview/review-gantt-rows'

import { scheduleCanvasMessages as m } from './schedule-canvas-messages'

interface DeleteTarget {
  level: 'task' | 'subtask'
  id: string
  title: string
  /** Phase: its subactivities go with it. */
  childCount: number
  /** Subactivity: the only one its phase has, which the backend refuses. */
  onlyChild: boolean
}

type Selected =
  | { level: 'task'; row: ReviewTask }
  | { level: 'subtask'; row: ReviewSubtask; parent: ReviewTask }

function findRow(tasks: ReviewTask[], id: string | null): Selected | null {
  if (!id) return null
  for (const task of tasks) {
    if (task.id === id) return { level: 'task', row: task }
    const subtask = task.subtasks.find((sub) => sub.id === id)
    if (subtask) return { level: 'subtask', row: subtask, parent: task }
  }
  return null
}

export interface ScheduleCanvasProps {
  projectId: string
  tasks: ReviewTask[]
  dependencies: ReviewDependency[]
  /** Rows carrying an open question — marked, and answered from the panel. */
  markedRowIds?: ReadonlySet<string>
  onOpenRow: (target: RowDrawerTarget) => void
}

const NO_MARKS: ReadonlySet<string> = new Set()

export function ScheduleCanvas({
  projectId,
  tasks,
  dependencies,
  markedRowIds = NO_MARKS,
  onOpenRow,
}: ScheduleCanvasProps) {
  const intl = useIntl()
  const toast = useIntlToast()
  const canCreate = usePermission('task.create')
  const canEdit = usePermission('task.edit')
  const canDelete = usePermission('task.delete')
  const canLink = usePermission('project.dependencies.manage')
  const canReport = usePermission('task.registerProgress')
  const [deleteRow, { isLoading: isDeleting }] = useDeleteReviewRowMutation()
  const [deleting, setDeleting] = useState<DeleteTarget | null>(null)
  // Week, like the live schedule: the chart scrolls through the span.
  const [zoom, setZoom] = useState<ZoomLevel>('week')

  const rows = useMemo(
    () => buildReviewScheduleRows(tasks, markedRowIds),
    [tasks, markedRowIds],
  )
  const edges = useMemo(
    () => buildReviewGanttEdges(dependencies, rows),
    [dependencies, rows],
  )
  const { collapsedIds, toggleCollapse } = usePhaseFolding(rows)
  const visibleRows = useMemo(
    () => collapseRows(rows, collapsedIds),
    [rows, collapsedIds],
  )
  const { selectedRowId, selectRow } = useScheduleSelection(rows)

  const addPhase = canCreate && (
    <Button
      size="sm"
      variant="outline"
      onClick={() => onOpenRow({ mode: 'create-task' })}
    >
      <Box as={Plus} boxSize={4} />
      {intl.formatMessage(m.addPhase)}
    </Button>
  )

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title={intl.formatMessage(m.emptyTitle)}
        action={
          canCreate
            ? {
                label: intl.formatMessage(m.addPhase),
                onClick: () => onOpenRow({ mode: 'create-task' }),
              }
            : undefined
        }
      />
    )
  }

  const selected = findRow(tasks, selectedRowId)
  const selectedRow = rows.find((row) => row.id === selectedRowId)

  const confirmDelete = async () => {
    if (!deleting) return
    try {
      await deleteRow({
        projectId,
        level: deleting.level,
        id: deleting.id,
      }).unwrap()
      toast.success(m.deleted)
      setDeleting(null)
    } catch {
      toast.error(m.deleteFailed)
    }
  }

  const panel = (current: Selected, scheduleRow: ScheduleRow) => {
    const { row } = current
    const isPhase = current.level === 'task'
    const sourceRow = current.level === 'subtask' ? row.source?.row : null
    const edit = () => onOpenRow({ mode: 'edit', rowId: row.id })
    return (
      <SelectionPanel
        scope="draft"
        row={scheduleRow}
        dependencyCount={
          dependencies.filter((edge) => edge.taskId === row.id).length
        }
        onClear={() => selectRow(null)}
        badges={
          <>
            {row.edited && (
              <Badge variant="gray" flexShrink={0}>
                {intl.formatMessage(m.editedBadge)}
              </Badge>
            )}
            {sourceRow && (
              <Text as="span" size="xs" color="muted" flexShrink={0}>
                {intl.formatMessage(m.sourceRow, { row: sourceRow })}
              </Text>
            )}
          </>
        }
        actions={
          <>
            {markedRowIds.has(row.id) && canLink && (
              <Button
                {...SELECTION_ACTION}
                variant="outline"
                color="warning"
                onClick={edit}
              >
                <Box as={CircleHelp} boxSize={4} />
                {intl.formatMessage(m.answerQuestion)}
              </Button>
            )}
            {(canEdit || canLink || (!isPhase && canReport)) && (
              <Button {...SELECTION_ACTION} variant="outline" onClick={edit}>
                <Box as={Pencil} boxSize={4} />
                {intl.formatMessage(m.actionEdit)}
              </Button>
            )}
            {isPhase && canCreate && (
              <Button
                {...SELECTION_ACTION}
                variant="ghost"
                onClick={() =>
                  onOpenRow({ mode: 'create-subtask', parentId: row.id })
                }
              >
                <Box as={Plus} boxSize={4} />
                {intl.formatMessage(m.actionAddSubtask)}
              </Button>
            )}
            {canDelete && (
              <Button
                {...SELECTION_ACTION}
                variant="ghost"
                {...getDestructiveActionTextColor()}
                onClick={() =>
                  setDeleting({
                    level: current.level,
                    id: row.id,
                    title: row.title,
                    childCount:
                      current.level === 'task'
                        ? current.row.subtasks.length
                        : 0,
                    onlyChild:
                      current.level === 'subtask' &&
                      current.parent.subtasks.length === 1,
                  })
                }
              >
                <Box as={Trash2} boxSize={4} />
                {intl.formatMessage(m.actionDelete)}
              </Button>
            )}
          </>
        }
      >
        {current.level === 'task' && (
          <Text size="xs" color="muted">
            {intl.formatMessage(
              // ms-bk adds the mirror subactivity itself at go-live (`TSK-3`);
              // until then a draft main activity keeps the file's figure.
              current.row.subtasks.length === 0
                ? m.mirrorNote
                : m.phaseProgressNote,
            )}
          </Text>
        )}
      </SelectionPanel>
    )
  }

  return (
    <Stack gap="tight" data-testid="schedule-canvas">
      {selected && selectedRow ? (
        panel(selected, selectedRow)
      ) : (
        <Card p={4} data-testid="schedule-selection-hint">
          <Text size="xs" color="muted">
            {intl.formatMessage(m.selectHint)}
          </Text>
        </Card>
      )}

      <ListToolbar direction="row" justify="flex-end" wrap="wrap">
        <GanttZoom value={zoom} onChange={setZoom} />
        {addPhase}
      </ListToolbar>

      <ScheduleGantt
        rows={visibleRows}
        edges={edges}
        dayWidth={ZOOM_DAY_WIDTH[zoom]}
        scope="draft"
        selectedRowId={selectedRowId}
        onSelectRow={selectRow}
        collapsedIds={collapsedIds}
        onToggleCollapse={toggleCollapse}
      />

      <Modal
        variant="confirmation"
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={intl.formatMessage(m.deleteTitle, {
          title: deleting?.title ?? '',
        })}
        description={
          deleting?.onlyChild
            ? intl.formatMessage(m.deleteOnlyChild)
            : intl.formatMessage(m.deleteBody, {
                count: deleting?.childCount ?? 0,
              })
        }
        confirmLabel={intl.formatMessage(m.actionDelete)}
        cancelLabel={intl.formatMessage(commonMessages.cancel)}
        confirmDisabled={deleting?.onlyChild}
        isConfirming={isDeleting}
        onConfirm={() => void confirmDelete()}
      />
    </Stack>
  )
}
