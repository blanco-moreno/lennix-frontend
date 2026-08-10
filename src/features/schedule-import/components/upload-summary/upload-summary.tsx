/**
 * Step 1, as it exists inside a *landed* draft: what the upload produced.
 *
 * The dropzone lives on the upload surface (`/import`), which is where a file
 * becomes a draft. There is no contract for dropping a second file into an
 * existing draft, so this step reports instead of inventing one — and the way
 * to work from another file is the honest one: import it as a new draft.
 */

import { Flex, Stack } from '@chakra-ui/react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { Button, Heading, Text } from '@/components'
import { PATHS } from '@/constants'
import type { ParseReport, ReviewImport } from '@/types'

import { uploadSummaryMessages as m } from './upload-summary-messages'

export interface UploadSummaryProps {
  scheduleImport: ReviewImport | null
  report: ParseReport
}

export function UploadSummary({ scheduleImport, report }: UploadSummaryProps) {
  const intl = useIntl()
  const navigate = useNavigate()

  const facts: { label: string; value: string }[] = [
    {
      label: intl.formatMessage(m.filename),
      value:
        scheduleImport?.sourceFilename ?? intl.formatMessage(m.unknownFile),
    },
    ...(scheduleImport?.sheet
      ? [{ label: intl.formatMessage(m.sheet), value: scheduleImport.sheet }]
      : []),
    {
      label: intl.formatMessage(m.rows),
      value: intl.formatMessage(m.rowCounts, {
        imported: report.rowsImported,
        scanned: report.rowsScanned,
        dropped: report.rowsDropped,
      }),
    },
  ]

  return (
    <Stack gap={4} data-testid="upload-summary">
      <Heading size="h4" color="primary">
        {intl.formatMessage(m.title)}
      </Heading>

      <Stack gap={2}>
        {facts.map((fact) => (
          <Flex key={fact.label} gap="tight" wrap="wrap">
            <Text size="sm" color="muted" minW="6rem">
              {fact.label}
            </Text>
            <Text size="sm" color="primary" weight="medium">
              {fact.value}
            </Text>
          </Flex>
        ))}
      </Stack>

      <Text size="sm" color="muted">
        {intl.formatMessage(m.explainer)}
      </Text>

      <Flex gap={2}>
        <Button
          variant="outline"
          onClick={async () => navigate(PATHS.PROJECT_IMPORT)}
        >
          {intl.formatMessage(m.importAnother)}
        </Button>
      </Flex>
    </Stack>
  )
}
