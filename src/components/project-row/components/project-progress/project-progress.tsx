import { Flex } from '@chakra-ui/react'
import { FormattedMessage } from 'react-intl'

import { Text, Progress } from '@/components/ui'
import { listCellsMessages } from '@/components/ui/list-cells/list-cells-messages'
import { ROW_PROGRESS_BAR_W } from '@/constants'
import type { ProjectSubject } from '@/types'
import {
  clampPercentage,
  formatPercent,
  getProjectProgressColor,
} from '@/utils'

/**
 * How far the obra is built, and nothing else. A gasto bar underneath would
 * make one cell answer two questions with the same shape; the money reads in
 * the money column, where its figure already is.
 *
 * The bar carries no label of its own: the column header (or the stacked
 * label below `lg`) already says which fact this is.
 */
export function ProjectProgress({ project }: { project: ProjectSubject }) {
  // A 0% bar reads as "started"; nothing built yet says so in words.
  if (!project.progress) {
    return (
      <Text as="span" size="xs" color="muted">
        <FormattedMessage {...listCellsMessages.noProgress} />
      </Text>
    )
  }

  return (
    <Flex align="center" gap={2} minW={0} w="full">
      <Progress
        aria-hidden
        w={ROW_PROGRESS_BAR_W}
        flexShrink={0}
        h={1.5}
        value={clampPercentage(project.progress)}
        indicatorProps={getProjectProgressColor(project.health.level)}
      />
      <Text as="span" size="xs" weight="medium" w="2.75rem" textAlign="right">
        {formatPercent(project.progress, 0)}
      </Text>
    </Flex>
  )
}
