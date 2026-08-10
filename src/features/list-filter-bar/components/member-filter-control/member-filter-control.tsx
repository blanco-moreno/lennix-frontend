import { Stack } from '@chakra-ui/react'
import { useIntl } from 'react-intl'

import { Label } from '@/components'
import { Combobox } from '@/components/ui/combobox/combobox'

import { FILTER_ALL } from '../../constants'
import { useMemberOptions } from '../../hooks/use-member-options'
import { listFilterBarMessages as m } from '../../list-filter-bar-messages'

interface MemberFilterControlProps {
  /** "Project manager" on `/projects`, "Assignee" on the activity lists. */
  label: string
  value: string | null
  onChange: (userId: string | null) => void
}

/**
 * The person picker — whoever the rows belong to on this surface.
 *
 * Its own component for the same reason as the obra picker: it fetches, and a
 * bar without a person filter must not pay for the roster.
 */
export function MemberFilterControl({
  label,
  value,
  onChange,
}: MemberFilterControlProps) {
  const intl = useIntl()
  const members = useMemberOptions()

  return (
    <Stack w={{ base: 'full', lg: 64 }} gap={2}>
      <Label color="fg.muted" fontSize="xs">
        {label}
      </Label>
      <Combobox
        value={value ?? FILTER_ALL}
        onValueChange={(next) => onChange(next === FILTER_ALL ? null : next)}
        placeholder={label}
        options={[
          { value: FILTER_ALL, label: intl.formatMessage(m.optionAll) },
          ...members.options,
        ]}
        isLoading={members.isLoading}
      />
    </Stack>
  )
}
