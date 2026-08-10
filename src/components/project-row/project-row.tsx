import { Box, chakra, Flex, Stack } from '@chakra-ui/react'
import { Wallet } from 'lucide-react'
import type { ReactNode } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Checkbox, ListRow, RowFact, StatusBadge, Text } from '@/components/ui'
import { projectGridColumns, PROJECT_ROW_MIN_H } from '@/constants'
import type { ProjectSubject } from '@/types'
import { healthTone, toneBorderStyle } from '@/utils'

import { projectListHeaderMessages as headers } from '../project-list-header/project-list-header-messages'

import { DraftAge } from './components/draft-age'
import { DraftStation } from './components/draft-station'
import { ProjectDeadline } from './components/project-deadline'
import { ProjectIdentity } from './components/project-identity'
import { ProjectMoney } from './components/project-money'
import { ProjectProgress } from './components/project-progress'
import { projectRowMessages as m } from './project-row-messages'

/** The name is the door into the obra — the only one the row draws. */
const NameButton = chakra('button')

interface ProjectRowProps {
  project: ProjectSubject
  /** Where the name goes — one destination per surface. */
  onClick: () => void
  /**
   * Facts only the calling surface knows, beside the name — the dashboard's
   * critical-path slip and at-risk counts ride here. Badges, not a column:
   * an extra track would be empty on every other surface, and a badge stays
   * on screen when the columns collapse. All of them render, at every width.
   */
  meta?: ReactNode
  /**
   * Bulk selection. Omit `onSelectedChange` and the leading track is not drawn
   * at all — a listing without bulk actions spends no gutter on it. The header
   * above must be told the same thing (`selectable`), or the two stop lining up.
   */
  selected?: boolean
  onSelectedChange?: (selected: boolean) => void
  'data-testid'?: string
}

/**
 * One obra, two lines — live or still a draft.
 *
 * Still a table (shared column template, one header, the same 3px tick), but
 * not the activity listing: a tile with the obra's initials where `/tasks`
 * puts a chevron, an owner and a place under the name, and two tracks that
 * answer the same two questions for both kinds of obra —
 *
 * | track  | live obra            | draft                     |
 * |--------|----------------------|---------------------------|
 * | signal | avance                | how far the review got    |
 * | time   | days left on the plan| how long it has waited    |
 *
 * which is what lets `/projects` and `/drafts` be one listing the user learns
 * once, without a draft pretending to have a progress bar it does not have.
 */
export function ProjectRow({
  project,
  onClick,
  meta,
  selected = false,
  onSelectedChange,
  'data-testid': testId,
}: ProjectRowProps) {
  const intl = useIntl()

  const isDraft = project.isDraft ?? false

  const subtitle = [project.managerName, project.location]
    .filter(Boolean)
    .join(' · ')

  // Which grid column the stacked cells drop into below `lg`.
  const contentColumn = onSelectedChange ? '3' : '2'

  const verdict = (
    <Flex align="center" gap={1.5} minW={0}>
      <StatusBadge domain="health" value={project.health.level} />
      {/* Over budget is red like everything else urgent — the icon is what
          says WHY, so a delayed obra that is also overspending shows both
          facts without inventing a second colour. Redundant when the verdict
          is already about money, so it is not drawn then. */}
      {project.isOverBudget && project.health.level !== 'over_budget' && (
        <Box
          as={Wallet}
          boxSize={3.5}
          flexShrink={0}
          color="overBudget"
          aria-label={intl.formatMessage(m.overBudgetMark)}
        />
      )}
    </Flex>
  )

  return (
    <ListRow
      templateColumns={projectGridColumns({ selectable: !!onSelectedChange })}
      minH={PROJECT_ROW_MIN_H}
      // The left tick is all that survives of the card's coloured frame: a
      // slipping obra stays findable at a glance, for 3px.
      //
      // It reads the server's verdict and nothing else. No `accent` override,
      // by design: a surface supplying its own tone is how the home came to
      // paint an obra amber while the listing painted the same one green.
      borderLeftWidth="3px"
      {...toneBorderStyle(healthTone(project.health.level))}
      bg={selected ? 'bg.muted' : 'bg.panel'}
      data-testid={testId}
    >
      {/* No selection, no track: `/projects` and the dashboard never select,
          and a checkbox column they never fill was dead gutter on every row. */}
      {onSelectedChange && (
        <Box role="cell" alignSelf={{ base: 'start', lg: 'center' }}>
          <Checkbox
            checked={selected}
            onCheckedChange={(value) => onSelectedChange(!!value)}
          />
        </Box>
      )}

      {/* The tile belongs to the name, so it sits on the name's line. The row
          centres its cells, which is right when the row is one line — but the
          name's line grows with the badges beside it, and a centred tile drifted
          down to whatever landed halfway. */}
      <Box role="cell" alignSelf={{ base: 'start', lg: 'center' }}>
        <ProjectIdentity
          name={project.name}
          healthLevel={project.health.level}
        />
      </Box>

      <Stack role="cell" gap={0.5} minW={0} mb={{ base: 1, lg: 0 }}>
        <Flex minW={0} align="center" gap={2} wrap="wrap">
          <Text
            asChild
            size="sm"
            weight="medium"
            color="primary"
            textAlign="start"
            maxW="full"
            _hover={{ textDecoration: 'underline' }}
          >
            <NameButton type="button" onClick={onClick}>
              {project.name}
            </NameButton>
          </Text>
          {meta}
        </Flex>

        {/* Who to call and where it is — the second line an activity has no
            need for, and the fastest way to tell the two listings apart. */}
        {subtitle && (
          <Text as="span" size="xs" color="muted">
            {subtitle}
          </Text>
        )}
      </Stack>

      {/* The same cells at both steps, in the same order: columns from `lg`,
          stacked under the name below it, each carrying the label its column
          would have had. */}
      <Box
        role="cell"
        gridColumn={{ base: contentColumn, lg: 'auto' }}
        minW={0}
      >
        <RowFact
          label={
            <FormattedMessage
              {...(isDraft ? headers.columnReview : headers.columnProgress)}
            />
          }
        >
          {isDraft ? (
            <DraftStation step={project.reviewStep} />
          ) : (
            <ProjectProgress project={project} />
          )}
        </RowFact>
      </Box>

      <Box
        role="cell"
        gridColumn={{ base: contentColumn, lg: 'auto' }}
        minW={0}
      >
        <RowFact label={<FormattedMessage {...headers.columnStatus} />}>
          {verdict}
        </RowFact>
      </Box>

      <Box
        role="cell"
        gridColumn={{ base: contentColumn, lg: 'auto' }}
        minW={0}
      >
        <RowFact
          label={
            <FormattedMessage
              {...(isDraft ? headers.columnWaiting : headers.columnDeadline)}
            />
          }
        >
          {isDraft ? (
            <DraftAge
              createdAt={project.createdAt}
              startDate={project.startDate}
              dueDate={project.dueDate}
            />
          ) : (
            <ProjectDeadline date={project.dueDate} />
          )}
        </RowFact>
      </Box>

      <Box
        role="cell"
        gridColumn={{ base: contentColumn, lg: 'auto' }}
        minW={0}
      >
        <RowFact label={<FormattedMessage {...headers.columnBudget} />}>
          <ProjectMoney project={project} />
        </RowFact>
      </Box>
    </ListRow>
  )
}
