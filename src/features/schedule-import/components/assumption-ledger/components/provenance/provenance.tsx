import { Stack } from '@chakra-ui/react'
import { useState } from 'react'
import { useIntl } from 'react-intl'

import { Button, Text } from '@/components'

import { assumptionLedgerMessages as m } from '../../assumption-ledger-messages'
import { type LedgerCause } from '../../ledger-model'

export function Provenance({ cause }: { cause: LedgerCause }) {
  const intl = useIntl()
  const [open, setOpen] = useState(false)

  if (cause.provenance.length === 0 && cause.samples.length === 0) return null

  return (
    <Stack gap={1}>
      <Button
        size="sm"
        variant="ghost"
        alignSelf="flex-start"
        onClick={() => setOpen((current) => !current)}
      >
        {intl.formatMessage(m.provenanceToggle)}
      </Button>

      {open && (
        <Stack gap={0.5} data-testid="cause-provenance">
          {cause.provenance.map((entry) => (
            <Text key={entry.ref} size="xs" color="muted">
              {entry.title && entry.sheet && entry.row !== null
                ? intl.formatMessage(m.provenanceRow, {
                    title: entry.title,
                    sheet: entry.sheet,
                    row: entry.row,
                  })
                : intl.formatMessage(m.provenanceRowUnknown, {
                    ref: entry.ref,
                  })}
            </Text>
          ))}
          {cause.samples.length > 0 && (
            <Text size="xs" color="muted">
              {intl.formatMessage(m.provenanceSamples, {
                samples: cause.samples.join(', '),
              })}
            </Text>
          )}
        </Stack>
      )}
    </Stack>
  )
}
