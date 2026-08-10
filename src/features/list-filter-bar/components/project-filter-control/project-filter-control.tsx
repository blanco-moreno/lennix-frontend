import { Stack } from '@chakra-ui/react'
import { useIntl } from 'react-intl'

import { Label } from '@/components'
import { Combobox } from '@/components/ui/combobox/combobox'
import { useProjectSearch } from '@/hooks'

import { FILTER_ALL } from '../../constants'
import { listFilterBarMessages as m } from '../../list-filter-bar-messages'

interface ProjectFilterControlProps {
  value: string | null
  onChange: (projectId: string | null) => void
}

/**
 * The obra picker, searching the server.
 *
 * Its own component because it fetches: `useProjectSearch` may not run on a bar
 * that carries no project filter, and a hook cannot be called conditionally.
 */
export function ProjectFilterControl({
  value,
  onChange,
}: ProjectFilterControlProps) {
  const intl = useIntl()
  const projectSearch = useProjectSearch()
  const label = intl.formatMessage(m.fieldProject)

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
          ...projectSearch.options,
        ]}
        onSearch={projectSearch.onSearch}
        isLoading={projectSearch.isLoading}
      />
    </Stack>
  )
}
