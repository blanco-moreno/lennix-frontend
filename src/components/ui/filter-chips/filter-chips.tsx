import { Box, Flex } from '@chakra-ui/react'
import { X } from 'lucide-react'
import { useIntl } from 'react-intl'

import { Button } from '../button'

import { filterChipsMessages } from './filter-chips-messages'

export interface FilterChip {
  /** Identifies the filter to the caller — the only thing `onRemove` receives. */
  key: string
  /** Already translated by the caller, who alone knows what the value means. */
  label: string
}

interface FilterChipsProps {
  /** The filters currently narrowing the list, in the order they should read. */
  chips: readonly FilterChip[]
  /** Drops exactly one filter; the rest stay put. */
  onRemove: (key: string) => void
}

/**
 * One removable chip per active filter.
 *
 * The component is deliberately ignorant: it knows nothing about URLs, Redux
 * or what "high priority" means, so the same bar serves /projects, /tasks and
 * every surface that grows filters later. The caller labels and translates —
 * that is where the meaning lives — and gets back the key it handed in.
 *
 * It is the rung below `FilterReset`: with five filters set, clearing all of
 * them is too coarse, and until the chips exist the user cannot even see which
 * five they are. The two compose in the caller; neither wraps the other.
 */
export function FilterChips({ chips, onRemove }: FilterChipsProps) {
  const intl = useIntl()

  // Same rule as FilterReset: an always-present control that does nothing
  // teaches the user to stop looking at it.
  if (chips.length === 0) return null

  return (
    <Flex
      role="group"
      aria-label={intl.formatMessage(filterChipsMessages.activeFilters)}
      wrap="wrap"
      gap={2}
    >
      {chips.map(({ key, label }) => (
        <Button
          key={key}
          type="button"
          size="sm"
          variant="outline"
          rounded="full"
          bg="bg.subtle"
          color="fg.default"
          aria-label={intl.formatMessage(filterChipsMessages.removeFilter, {
            label,
          })}
          onClick={() => onRemove(key)}
        >
          {label}
          <Box as={X} boxSize={3.5} color="fg.muted" />
        </Button>
      ))}
    </Flex>
  )
}
