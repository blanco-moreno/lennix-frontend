import { Box, Flex, Stack } from '@chakra-ui/react'
import { History } from 'lucide-react'
import { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Button, EmptyState, Skeleton, Text } from '@/components'
import { useFormatDate } from '@/i18n'
import {
  PROJECT_ACTIVITY_PAGE_SIZE,
  useGetProjectActivityQuery,
} from '@/services/project'

import { groupByDay } from './history-model'
import { useActivitySentence } from './hooks/use-activity-sentence'
import { projectHistoryMessages as m } from './project-history-messages'

/** Lets a test read back one composed sentence per row. */
export const HISTORY_ENTRY_TEST_ID = 'historial-entry'

interface ProjectHistoryProps {
  projectId: string
}

/**
 * "Historial" — the project's record of what happened, read from
 * `GET /v1/projects/:id/activity`. The feed carries structured fields and no
 * prose; the sentence is composed here, in the reader's locale.
 *
 * Read only, every row. A record is a thing you read, not a menu: half the
 * rows named an entity the activity address cannot take (a subtask, an
 * expense), so a clickable row was a coin flip between a destination and a
 * dead link.
 */
export function ProjectHistory({ projectId }: ProjectHistoryProps) {
  const intl = useIntl()
  const formatDate = useFormatDate()
  const sentenceFor = useActivitySentence()
  // "Load more" asks for the next page and the service accumulates them, so
  // this is a page number, not a growing page size. Reset on the
  // project so opening another obra starts at its own first page.
  const [page, setPage] = useState(1)
  const [lastProjectId, setLastProjectId] = useState(projectId)
  if (projectId !== lastProjectId) {
    setLastProjectId(projectId)
    setPage(1)
  }

  const { data, isLoading, isFetching, isError } = useGetProjectActivityQuery(
    { projectId, page, pageSize: PROJECT_ACTIVITY_PAGE_SIZE },
    // The record is what happened: somebody who just completed an activity and
    // opens this tab has to see it.
    { refetchOnMountOrArgChange: true },
  )

  const entries = data?.items ?? []
  const hasMore = entries.length < (data?.total ?? 0)

  return (
    <Stack gap="section">
      <Text size="sm" color="muted">
        <FormattedMessage {...m.historyCaption} />
      </Text>

      {isLoading ? (
        <Stack gap="section" aria-hidden>
          {Array.from({ length: 3 }).map((_, group) => (
            <Stack key={group} gap="tight">
              <Skeleton h={3} w="8rem" />
              <Skeleton h={12} rounded="lg" />
              <Skeleton h={12} rounded="lg" />
            </Stack>
          ))}
        </Stack>
      ) : isError ? (
        <Text size="sm" color="error">
          <FormattedMessage {...m.historyLoadError} />
        </Text>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={History}
          title={intl.formatMessage(m.historyEmptyTitle)}
          description={intl.formatMessage(m.historyEmptyDescription)}
        />
      ) : (
        <Stack gap="section">
          {groupByDay(entries).map(({ day, entries: dayEntries }) => (
            <Stack key={day} gap="tight">
              <Text
                size="xs"
                weight="semibold"
                color="muted"
                letterSpacing="wider"
                textTransform="uppercase"
              >
                {formatDate(day)}
              </Text>
              <Stack gap={4} borderLeftWidth="2px" borderColor="border" pl={5}>
                {dayEntries.map((entry) => (
                  <Box
                    key={entry.id}
                    data-testid={HISTORY_ENTRY_TEST_ID}
                    position="relative"
                  >
                    <Box
                      position="absolute"
                      left="-25px"
                      top={1.5}
                      boxSize={2}
                      rounded="full"
                      bg="complementary"
                    />
                    <Text size="sm">{sentenceFor(entry)}</Text>
                  </Box>
                ))}
              </Stack>
            </Stack>
          ))}

          {hasMore && (
            <Flex justify="center" gap={2}>
              <Button
                variant="outline"
                size="sm"
                disabled={isFetching}
                onClick={() => setPage((current) => current + 1)}
              >
                <FormattedMessage {...m.historyLoadMore} />
              </Button>
            </Flex>
          )}
        </Stack>
      )}
    </Stack>
  )
}
