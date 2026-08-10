/**
 * The draft's schedule, as a listing.
 *
 * Rows are ordered by the file's own dates (source dates are authoritative
 * until go-live) and laid out on one column template under one header — the
 * same shape `/tasks` uses, because it is the same job: read a lot of
 * activities down a page. The card-per-phase this replaced stood ~200px tall
 * before its first row, so a screen held two phases.
 *
 * Editing stays in place, opened per row instead of printed under every row.
 */

import { Box, Flex, Stack } from '@chakra-ui/react'
import { Calendar } from 'lucide-react'
import { useState } from 'react'
import { useIntl } from 'react-intl'

import { EmptyState, Heading, Text } from '@/components'
import type { ReviewTask } from '@/types'

import { sortChronologically } from './canvas-model'
import { ScheduleListHeader } from './components/schedule-list-header'
import { ScheduleRow } from './components/schedule-row'
import { scheduleCanvasMessages as m } from './schedule-canvas-messages'

export interface ScheduleCanvasProps {
  tasks: ReviewTask[]
  /** Highlights the rows the receipt's active number refers to. */
  highlight?: 'phases' | 'activities' | null
  /**
   * The draft being reviewed. With it every row is editable in place — the
   * universal correction floor; without it the canvas is a read-only render.
   */
  projectId?: string
}

export function ScheduleCanvas({
  tasks,
  highlight = null,
  projectId,
}: ScheduleCanvasProps) {
  const intl = useIntl()
  // Only the first phase opens. A file with twelve sections opened flat was
  // 200 rows before the second heading — the listing has to be readable as a
  // list of phases first, and expandable from there.
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(
    () =>
      new Set(
        sortChronologically(tasks)
          .slice(1)
          .map((task) => task.id),
      ),
  )
  const [editingId, setEditingId] = useState<string | null>(null)

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title={intl.formatMessage(m.emptyTitle)}
        description={intl.formatMessage(m.emptyDescription)}
      />
    )
  }

  const toggle = (taskId: string) =>
    setCollapsed((current) => {
      const next = new Set(current)
      if (!next.delete(taskId)) next.add(taskId)
      return next
    })

  const activityCount = tasks.reduce(
    (total, task) => total + task.subtasks.length,
    0,
  )

  return (
    <Stack gap="tight" data-testid="schedule-canvas">
      <Flex align="baseline" gap="tight" wrap="wrap">
        <Heading size="h4" color="primary">
          {intl.formatMessage(m.title)}
        </Heading>
        <Text size="sm" color="muted">
          {intl.formatMessage(m.phaseCount, {
            phases: tasks.length,
            activities: activityCount,
          })}
        </Text>
      </Flex>

      <Box
        rounded="lg"
        borderWidth="1px"
        borderColor={highlight ? 'complementary' : 'border'}
        bg="bg.panel"
        overflow="hidden"
      >
        <ScheduleListHeader />

        {sortChronologically(tasks).map((task) => {
          const isOpen = !collapsed.has(task.id)
          return (
            <Box key={task.id}>
              <ScheduleRow
                level="task"
                row={task}
                projectId={projectId}
                childCount={task.subtasks.length}
                isOpen={isOpen}
                onToggle={() => toggle(task.id)}
                isEditing={editingId === task.id}
                onEditingChange={(editing) =>
                  setEditingId(editing ? task.id : null)
                }
              />

              {isOpen &&
                (task.subtasks.length > 0 ? (
                  sortChronologically(task.subtasks).map((subtask) => (
                    <ScheduleRow
                      key={subtask.id}
                      level="subtask"
                      row={subtask}
                      projectId={projectId}
                      sourceRow={subtask.source?.row ?? null}
                      pathPrefix={subtask.depth > 1 ? subtask.path : undefined}
                      isEditing={editingId === subtask.id}
                      onEditingChange={(editing) =>
                        setEditingId(editing ? subtask.id : null)
                      }
                    />
                  ))
                ) : (
                  // One quiet line, not a proposal to accept: ms-bk adds the
                  // mirror subactivity itself at go-live.
                  <Box
                    pl={{ base: 3, md: 11 }}
                    pr={3}
                    py={2}
                    borderTopWidth="1px"
                    borderColor="border.muted"
                  >
                    <Text size="xs" color="muted">
                      {intl.formatMessage(m.mirrorNote)}
                    </Text>
                  </Box>
                ))}
            </Box>
          )
        })}
      </Box>
    </Stack>
  )
}
