/**
 * One row of the draft schedule listing — a phase or one of its subactivities.
 *
 * Same shape as the `/tasks` listing: columns under a shared header, one row
 * per activity, editing opened from the row's own action rather than printed
 * under every row. What it does *not* borrow is the live listing's columns —
 * a draft has no status, no assignee and no computed progress, and inventing
 * them here would be the one thing the review surface must never do.
 */

import { Box, Flex, Grid } from '@chakra-ui/react'
import { ChevronDown, ChevronRight, Layers, Pencil } from 'lucide-react'
import { useIntl } from 'react-intl'

import { Badge, Button, Text } from '@/components'
import { useFormatDate } from '@/i18n'

import { InlineRowEdit } from '../../../inline-row-edit'
import { spanDays } from '../../canvas-model'
import { DRAFT_GRID_COLUMNS, DRAFT_ROW_MIN_H } from '../../draft-grid'
import { scheduleCanvasMessages as m } from '../../schedule-canvas-messages'

export interface ScheduleRowProps {
  level: 'task' | 'subtask'
  row: {
    id: string
    title: string
    startDate: string | null
    dueDate: string | null
    edited: boolean
  }
  /** The draft being reviewed — without it the listing is read-only. */
  projectId?: string
  /** Phase only: how many subactivities it groups, and whether they show. */
  childCount?: number
  isOpen?: boolean
  onToggle?: () => void
  /** Source-file row number, when the parser recorded one. */
  sourceRow?: number | null
  /**
   * Ancestor titles the 2-level model flattened (root→leaf). Rendered as a
   * breadcrumb before the title so same-named rows stop reading as duplicates.
   */
  pathPrefix?: string[]
  isEditing?: boolean
  onEditingChange?: (editing: boolean) => void
}

export function ScheduleRow({
  level,
  row,
  projectId,
  childCount,
  isOpen = false,
  onToggle,
  sourceRow = null,
  pathPrefix,
  isEditing = false,
  onEditingChange,
}: ScheduleRowProps) {
  const intl = useIntl()
  const formatDate = useFormatDate()
  const isPhase = level === 'task'
  const days = spanDays(row.startDate, row.dueDate)
  const dates =
    row.startDate || row.dueDate
      ? intl.formatMessage(m.dateRange, {
          start: row.startDate ? formatDate(row.startDate) : '—',
          end: row.dueDate ? formatDate(row.dueDate) : '—',
        })
      : intl.formatMessage(m.undated)
  const duration =
    days === null ? '—' : intl.formatMessage(m.durationDays, { count: days })

  return (
    <>
      <Grid
        templateColumns={DRAFT_GRID_COLUMNS}
        alignItems="center"
        columnGap="tight"
        minH={DRAFT_ROW_MIN_H}
        px="tight"
        py={1.5}
        borderTopWidth="1px"
        borderColor="border.muted"
        bg={isPhase ? 'bg.subtle/60' : undefined}
        _hover={{ bg: 'bg.muted/50' }}
        data-testid={isPhase ? 'schedule-phase' : 'schedule-activity'}
      >
        {isPhase && childCount ? (
          <Button
            variant="ghost"
            size="icon"
            boxSize={{ base: 9, lg: 7 }}
            minW={{ base: 9, lg: 7 }}
            aria-expanded={isOpen}
            aria-label={intl.formatMessage(isOpen ? m.collapse : m.expand, {
              count: childCount,
            })}
            onClick={onToggle}
          >
            <Box as={isOpen ? ChevronDown : ChevronRight} boxSize={4} />
          </Button>
        ) : (
          <span />
        )}

        <Flex minW={0} align="center" gap={2} wrap="wrap">
          <Text
            size="sm"
            weight={isPhase ? 'semibold' : 'normal'}
            color="primary"
            maxW="full"
            // Subactivities are indented under their phase, so the WBS is
            // legible without a second border to draw it.
            pl={isPhase ? 0 : 5}
            title={
              pathPrefix?.length
                ? `${pathPrefix.join(' › ')} › ${row.title}`
                : row.title
            }
          >
            {pathPrefix?.length ? (
              <Box
                as="span"
                color="fg.muted"
              >{`${pathPrefix.join(' › ')} › `}</Box>
            ) : null}
            {row.title}
          </Text>

          {isPhase && childCount !== undefined && childCount > 0 && (
            <Flex flexShrink={0} align="center" gap={1} color="fg.muted">
              <Box as={Layers} boxSize={3.5} />
              <Text as="span" size="xs" color="muted">
                {childCount}
              </Text>
            </Flex>
          )}

          {row.edited && (
            <Badge variant="gray" flexShrink={0}>
              {intl.formatMessage(m.editedBadge)}
            </Badge>
          )}

          {sourceRow !== null && (
            <Text as="span" size="xs" color="muted" flexShrink={0}>
              {intl.formatMessage(m.sourceRow, { row: sourceRow })}
            </Text>
          )}

          {/* Below `lg` the dates and duration columns are gone, so the row
              says them here instead of dropping them. */}
          <Text as="span" size="xs" color="muted" hideFrom="lg" w="full">
            {days === null ? dates : `${dates} · ${duration}`}
          </Text>
        </Flex>

        <Box hideBelow="lg" minW={0}>
          <Text as="span" size="xs" color="muted">
            {dates}
          </Text>
        </Box>

        <Box hideBelow="lg" minW={0}>
          <Text as="span" size="xs" color="muted">
            {duration}
          </Text>
        </Box>

        {projectId ? (
          <Button
            variant="ghost"
            size="icon"
            boxSize={{ base: 9, lg: 7 }}
            minW={{ base: 9, lg: 7 }}
            aria-expanded={isEditing}
            aria-label={intl.formatMessage(m.editRow, { title: row.title })}
            onClick={() => onEditingChange?.(!isEditing)}
          >
            <Box as={Pencil} boxSize={3.5} />
          </Button>
        ) : (
          <span />
        )}
      </Grid>

      {/* The form goes under the row, full width: squeezed into the action
          column it would be three fields in 4.5rem. */}
      {projectId && isEditing && (
        <Box
          px="tight"
          py={3}
          bg="bg.subtle"
          borderTopWidth="1px"
          borderColor="border.muted"
        >
          <InlineRowEdit
            projectId={projectId}
            level={level}
            row={row}
            open
            onOpenChange={(next) => onEditingChange?.(next)}
          />
        </Box>
      )}
    </>
  )
}
