import { Stack } from '@chakra-ui/react'

import { Label, Select } from '@/components'
import { DateInput } from '@/components/ui/date-input'
import type { ListFilterKey, ListQueryState } from '@/router'

import { FILTER_ALL } from '../../constants'
import type { FilterVocabulary } from '../../hooks/use-filter-vocabulary'

/** The two range bounds are dates; every other pure control is a select. */
const DATE_FIELDS: readonly ListFilterKey[] = ['dueAfter', 'dueBefore']

interface FilterControlProps {
  field: ListFilterKey
  state: ListQueryState
  vocabulary: FilterVocabulary
  /**
   * The value as the URL spells it, or `null` for "stop narrowing by this".
   * The control speaks that spelling and nothing else — turning `'true'` into
   * a boolean is the caller's job, once, where the state's types live.
   */
  onChange: (field: ListFilterKey, value: string | null) => void
}

/**
 * One labelled filter control, chosen by the field it edits.
 *
 * Every surface renders the same control for the same field, which is the
 * whole point of it existing: `/projects` and `/tasks` are homologated on
 * purpose, and two hand-built bars drift within a release.
 */
export function FilterControl({
  field,
  state,
  vocabulary,
  onChange,
}: FilterControlProps) {
  const label = vocabulary.fieldLabel(field)
  const raw = state[field]
  const value = raw === null || raw === '' ? '' : String(raw)

  return (
    <Stack w={{ base: 'full', lg: 56 }} gap={2}>
      <Label color="fg.muted" fontSize="xs">
        {label}
      </Label>

      {DATE_FIELDS.includes(field) ? (
        <DateInput
          value={value || undefined}
          // An emptied picker clears the bound rather than sending an empty
          // `due_before=`, which the backend reads as a malformed date.
          onValueChange={(isoDate) => onChange(field, isoDate || null)}
        />
      ) : (
        <Select
          value={value || FILTER_ALL}
          onChange={(next) =>
            onChange(field, next === FILTER_ALL ? null : next)
          }
          placeholder={label}
          options={vocabulary.optionsFor(field)}
        />
      )}
    </Stack>
  )
}
