import { Flex } from '@chakra-ui/react'
import { useIntl } from 'react-intl'

import { Badge, Text, Tooltip } from '@/components'
import { dependencyEditorMessages as dm } from '@/features/dependency-edits'
import { RELATIONSHIP_ORDER } from '@/utils'

import { MARK_SIZE, ROW_MARKS } from '../../row-marks'
import { scheduleGanttMessages as m } from '../../schedule-gantt-messages'
import {
  BAR_SUBTASK,
  BAR_CRITICAL,
  BAR_DELAY,
  BAR_TASK,
  EDGE_BROKEN,
} from '../../schedule-palette'
import { LegendSwatch } from '../legend-swatch'

interface GanttLegendProps {
  /**
   * `draft` drops everything the engine owns and keeps the one mark a draft
   * has: the open question.
   *
   * A draft's chart has no critical path, no propagated delay and no blocked
   * or forced rows — the engine has not run. Explaining swatches that cannot
   * appear is worse than saying nothing: it promises the reader a reading of
   * the chart that the chart does not contain.
   */
  scope?: 'live' | 'draft'
}

/** The chart's legends: level/critical/delay swatches and the PDM dependency
 *  notation. Keys off the same palette the bars use, so a swatch can never
 *  drift from the shape it explains. */
export function GanttLegend({ scope = 'live' }: GanttLegendProps) {
  const intl = useIntl()
  const isDraft = scope === 'draft'
  return (
    <>
      <Flex gap={4} mt={2} wrap="wrap">
        <LegendSwatch
          color={BAR_TASK}
          label={intl.formatMessage(m.levelTask)}
        />
        <LegendSwatch
          color={BAR_SUBTASK}
          label={intl.formatMessage(m.levelSubtask)}
        />
        {!isDraft && (
          <>
            <LegendSwatch
              color={BAR_CRITICAL}
              hatched
              label={intl.formatMessage(m.legendCritical)}
            />
            <LegendSwatch
              color={BAR_DELAY}
              label={intl.formatMessage(m.legendDelay)}
            />
          </>
        )}
        <LegendSwatch
          color={EDGE_BROKEN}
          dashed
          label={intl.formatMessage(m.legendBroken)}
        />
      </Flex>

      {/*
        The row marks. They are icons in the label column — which is what
        gave the name its width back — so the chart owes the reader their
        meaning. Rendered from ROW_MARKS, the same list the rows render,
        narrowed to the marks this scope can carry.
      */}
      <Flex gap={4} mt={2} wrap="wrap" data-testid="gantt-marks-legend">
        {ROW_MARKS.filter((mark) => (mark.draft ?? false) === isDraft).map(
          (mark) => (
            <Flex key={mark.id} align="center" gap={1.5}>
              <mark.icon size={MARK_SIZE} color={mark.color} aria-hidden />
              <Text size="xs" color="muted">
                {intl.formatMessage(mark.label)}
              </Text>
            </Flex>
          ),
        )}
      </Flex>

      {/*
        The dependency legend. FS/SS/FF/SF is international PDM notation, which
        means it is precise and says nothing to a reader who has not met it —
        and edges are drawn on this chart, so this is where it has to be
        explained, not only inside a selected edge's card.
      */}
      {!isDraft && (
        <Flex
          gap="tight"
          mt={2}
          wrap="wrap"
          align="center"
          data-testid="gantt-dependency-legend"
        >
          <Text size="xs" color="muted">
            {intl.formatMessage(m.legendDependencies)}
          </Text>
          {RELATIONSHIP_ORDER.map((type) => (
            <Tooltip
              key={type}
              content={intl.formatMessage(dm[`relationship${type}Long`])}
            >
              <Flex
                align="center"
                gap={1}
                tabIndex={0}
                data-testid={`dependency-legend-${type}`}
              >
                <Badge variant="gray">
                  {intl.formatMessage(dm[`relationship${type}`])}
                </Badge>
                <Text size="xs" color="muted">
                  {intl.formatMessage(dm[`relationship${type}Help`])}
                </Text>
              </Flex>
            </Tooltip>
          ))}
        </Flex>
      )}
    </>
  )
}
