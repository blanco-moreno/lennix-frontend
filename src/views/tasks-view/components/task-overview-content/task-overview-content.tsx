import { Box, Flex } from '@chakra-ui/react'
import { GanttChartSquare, Network } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { Button, ListRowSkeleton, Text } from '@/components'
import { TASK_GRID_COLUMNS, TASK_ROW_MIN_H } from '@/constants'
import { PROJECT_TAB_PARAM } from '@/router'
import type { Task } from '@/types'
import { groupTasksByProject } from '@/utils'

import { tasksViewMessages } from '../../tasks-view-messages'
import { TaskListHeader } from '../task-list-header'
import { TaskRow } from '../task-row'

interface TaskOverviewContentProps {
  /** The current page of activities — already narrowed by the server. */
  tasks: Task[]
  /** The listing draws its own rows while they arrive — no outer branch. */
  isLoading?: boolean
}

/**
 * Renders the page the server returned, grouped by obra. No second pass over
 * `tasks`: the filters are query params, so every row that arrived matched.
 * The group heading reads the obra's name off the rows themselves. The filter
 * bar and the paginator sit above, owned by the tab.
 *
 * One table, one header, a 36px band per obra: the grouping costs a line, not
 * a card, so the vertical budget goes to activities.
 */
export function TaskOverviewContent({
  tasks,
  isLoading = false,
}: TaskOverviewContentProps) {
  const intl = useIntl()
  const navigate = useNavigate()

  const groupedByProject = groupTasksByProject(tasks)

  return (
    <Box
      role={isLoading ? 'presentation' : 'table'}
      aria-label={
        isLoading ? undefined : intl.formatMessage(tasksViewMessages.tabList)
      }
      aria-busy={isLoading || undefined}
      borderWidth="1px"
      borderColor="border"
      rounded="lg"
      bg="bg.panel"
    >
      <TaskListHeader context="assignee" />

      {isLoading && (
        <ListRowSkeleton
          templateColumns={TASK_GRID_COLUMNS}
          minH={TASK_ROW_MIN_H}
          count={6}
        />
      )}

      {!isLoading &&
        Object.entries(groupedByProject).map(([projectId, taskList]) => {
          // Every row in a group shares the obra, so the first one names it.
          // The id stays the fallback: a row whose `projectName` did not come
          // through is still reachable, just unnamed.
          const projectName = taskList[0]?.projectName ?? projectId
          return (
            // One rowgroup per obra, named by the obra: the visual grouping and
            // the announced grouping are the same grouping.
            <Box key={projectId} role="rowgroup" aria-label={projectName}>
              {/* The group band is the way back into the project's own schedule
                — this list is the portfolio view of it, not a competing
                home. A row of one cell, which is what a band spanning every
                column is. */}
              <Flex
                role="row"
                minH={{ base: 'auto', lg: '2.25rem' }}
                bg="bg.muted"
                borderBottomWidth="1px"
                borderColor="border"
                px={3}
                py={{ base: 2, lg: 1 }}
                gap={2}
              >
                {/* One line on a wide screen. On a phone the obra's name needs
                  the whole width — squeezed beside the count and the link it
                  broke across three lines and left them crammed against it —
                  so the band becomes two lines: the name, then what to do
                  with it. */}
                <Flex
                  role="cell"
                  flex="1"
                  minW={0}
                  direction={{ base: 'column', lg: 'row' }}
                  align={{ base: 'stretch', lg: 'center' }}
                  justify={{ lg: 'space-between' }}
                  gap={{ base: 1, lg: 'tight' }}
                >
                  <Flex minW={0} align="center" gap={2} wrap="wrap">
                    <Box as={Network} boxSize={3.5} flexShrink={0} />
                    <Text
                      as="span"
                      size="xs"
                      weight="semibold"
                      letterSpacing={{ lg: 'wider' }}
                      textTransform="uppercase"
                    >
                      {projectName}
                    </Text>
                    <Text as="span" size="xs" color="muted" flexShrink={0}>
                      <FormattedMessage
                        {...tasksViewMessages.groupTaskCount}
                        values={{ count: taskList.length }}
                      />
                    </Text>
                  </Flex>
                  <Button
                    variant="ghost"
                    size="sm"
                    h="auto"
                    flexShrink={0}
                    alignSelf={{ base: 'flex-start', lg: 'auto' }}
                    onClick={async () =>
                      navigate(
                        `/projects/${projectId}?${PROJECT_TAB_PARAM}=schedule`,
                      )
                    }
                  >
                    <Box as={GanttChartSquare} boxSize={3.5} mr={1} />
                    <FormattedMessage
                      {...tasksViewMessages.openProjectSchedule}
                    />
                  </Button>
                </Flex>
              </Flex>

              {taskList.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </Box>
          )
        })}
    </Box>
  )
}
