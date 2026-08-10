/**
 * Landing view for an upload diverted below the quality floor. The job carries
 * the parse report and ledger because a diverted upload has no draft to serve them from.
 */

import { Box, Flex, SimpleGrid, Stack } from '@chakra-ui/react'
import { FileWarning } from 'lucide-react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { Button, Card, EmptyState, Heading, Skeleton, Text } from '@/components'
import { PATHS } from '@/constants'
import { useGetImportJobQuery } from '@/services/schedule-import'
import type { ParseQuality } from '@/types'
import { formatPercent } from '@/utils'

import { useTrustCopy } from '../../hooks/use-trust-copy'

import { assistedMappingMessages as m } from './assisted-mapping-messages'

/** How many binned rows to list before saying "…and N more". */
const MAX_LISTED_UNPLACED = 8

function useQualityReasons() {
  const intl = useIntl()

  return (quality: ParseQuality): string[] =>
    quality.reasons.map((reason) => {
      switch (reason) {
        case 'no_schedule_table':
          return intl.formatMessage(m.reasonNoScheduleTable)
        case 'no_rows':
          return intl.formatMessage(m.reasonNoRows)
        case 'low_resolution':
          return intl.formatMessage(m.reasonLowResolution, {
            ratio: formatPercent(quality.resolutionRatio * 100, 0),
            threshold: formatPercent(quality.threshold * 100, 0),
          })
        case 'no_schedule_signal':
          return intl.formatMessage(m.reasonNoScheduleSignal)
        default:
          // ms-ai owns this vocabulary and may extend it; showing the raw
          // reason beats swallowing a cause we have no copy for yet.
          return reason
      }
    })
}

export interface AssistedMappingProps {
  jobId: string
}

export function AssistedMapping({ jobId }: AssistedMappingProps) {
  const intl = useIntl()
  const navigate = useNavigate()
  const qualityReasons = useQualityReasons()
  const copy = useTrustCopy()

  const {
    data: job,
    isLoading,
    isError,
  } = useGetImportJobQuery(jobId, {
    skip: !jobId,
  })

  if (isLoading) {
    return (
      <Stack gap="block">
        <Skeleton h={10} rounded="md" />
        <Skeleton h="16rem" rounded="lg" />
      </Stack>
    )
  }

  if (isError || !job) {
    return (
      <EmptyState
        icon={FileWarning}
        title={intl.formatMessage(m.notFoundTitle)}
        description={intl.formatMessage(m.notFoundDescription)}
        action={{
          label: intl.formatMessage(m.importAnother),
          onClick: async () => navigate(PATHS.PROJECT_IMPORT),
        }}
      />
    )
  }

  const reasons = qualityReasons(job.quality)
  const sheetReason = copy.sheetReason(job.report.sheetEvidence)
  const listedUnplaced = job.report.unclassified.slice(0, MAX_LISTED_UNPLACED)
  const hiddenUnplaced = Math.max(
    0,
    job.report.unclassifiedTotal - listedUnplaced.length,
  )

  return (
    <Stack
      gap={{ base: 6, md: 8 }}
      maxW="5xl"
      mx="auto"
      w="full"
      data-testid="assisted-mapping"
    >
      {/* Still step 1: a diverted upload has not produced a draft yet. */}
      <Stack gap="tight">
        <Flex align="center" gap="tight">
          <Box as={FileWarning} boxSize={8} color="warning" />
          <Heading size="h1" color="primary">
            {intl.formatMessage(m.title, { fileName: job.sourceFilename })}
          </Heading>
        </Flex>
        <Text size="lg" color="muted">
          {intl.formatMessage(m.subtitle)}
        </Text>
      </Stack>

      {reasons.length > 0 && (
        <Card borderColor="warning/40" bg="warning/5">
          <Stack gap="tight">
            <Heading size="h4" color="primary">
              {intl.formatMessage(m.whyTitle)}
            </Heading>
            {reasons.map((reason) => (
              <Text key={reason} color="muted">
                {reason}
              </Text>
            ))}
            {/* The counts, not `quality.detail`: that field is ms-ai's English
                prose twin of these same numbers and is never rendered. */}
            <Text color="muted">{copy.qualitySummary(job.quality)}</Text>
          </Stack>
        </Card>
      )}

      <Card>
        <Stack gap="section">
          <Heading size="h4" color="primary">
            {intl.formatMessage(m.whatWasReadTitle)}
          </Heading>
          <SimpleGrid columns={{ base: 1, sm: 3 }} gap={4}>
            {[
              intl.formatMessage(m.rowsScanned, {
                count: job.report.rowsScanned,
              }),
              intl.formatMessage(m.rowsImported, {
                count: job.report.rowsImported,
              }),
              intl.formatMessage(m.rowsDropped, {
                count: job.report.rowsDropped,
              }),
            ].map((line) => (
              <Text
                key={line}
                size="lg"
                weight="medium"
                color="primary"
                rounded="lg"
                bg="bg.subtle"
                px={4}
                py={3}
              >
                {line}
              </Text>
            ))}
          </SimpleGrid>
          {sheetReason && (
            <Text size="xs" color="muted">
              {sheetReason}
            </Text>
          )}
        </Stack>
      </Card>

      {listedUnplaced.length > 0 && (
        <Card>
          <Stack gap="tight">
            <Heading size="h4" color="primary">
              {intl.formatMessage(m.unplacedTitle)}
            </Heading>
            {listedUnplaced.map((row) => (
              <Text key={`${row.sheet}-${row.row}`} color="muted">
                {intl.formatMessage(m.unplacedRow, {
                  row: row.row,
                  text: row.text,
                })}
              </Text>
            ))}
            {hiddenUnplaced > 0 && (
              <Text size="xs" color="muted">
                {intl.formatMessage(m.unplacedMore, { count: hiddenUnplaced })}
              </Text>
            )}
          </Stack>
        </Card>
      )}

      <Card>
        <Stack gap={4} align="flex-start">
          <Heading size="h4" color="primary">
            {intl.formatMessage(m.mappingSoonTitle)}
          </Heading>
          <Text color="muted">{intl.formatMessage(m.mappingSoonBody)}</Text>
          <Button
            size="lg"
            onClick={async () => navigate(PATHS.PROJECT_IMPORT)}
          >
            {intl.formatMessage(m.importAnother)}
          </Button>
        </Stack>
      </Card>
    </Stack>
  )
}
