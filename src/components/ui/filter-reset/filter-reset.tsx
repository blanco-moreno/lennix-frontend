import { Box } from '@chakra-ui/react'
import { X } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { Button } from '../button'

import { filterResetMessages } from './filter-reset-messages'

interface FilterResetProps {
  /**
   * True when at least one control on the bar differs from its default. The
   * button renders nothing when it is false: a permanently-lit reset that
   * clears nothing teaches the user to ignore it.
   */
  isActive: boolean
  /** Puts *every* control on the bar back to its default, search text included. */
  onReset: () => void
}

/**
 * The reset control shared by every filter bar.
 *
 * It lives in `components/ui` rather than in each dashboard because the same
 * bar shape recurs — the papelera and Borradores will grow filters too, and a
 * per-surface answer is how the pagination defaults ended up disagreeing.
 */
export function FilterReset({ isActive, onReset }: FilterResetProps) {
  if (!isActive) return null

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      alignSelf={{ base: 'flex-start', lg: 'flex-end' }}
      onClick={onReset}
    >
      <Box as={X} boxSize={4} />
      <FormattedMessage {...filterResetMessages.clearFilters} />
    </Button>
  )
}
