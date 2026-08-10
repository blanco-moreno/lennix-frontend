import { chakra } from '@chakra-ui/react'

import type { NarrationFocus } from '../../narration'

interface ReceiptNumberProps {
  label: string
  focus: NarrationFocus
  isActive: boolean
  tone?: 'default' | 'warning'
  onFocus?: (focus: NarrationFocus) => void
}

export function ReceiptNumber({
  label,
  focus,
  isActive,
  tone = 'default',
  onFocus,
}: ReceiptNumberProps) {
  return (
    <chakra.button
      type="button"
      onClick={() => onFocus?.(focus)}
      aria-pressed={isActive}
      rounded="lg"
      borderWidth="1px"
      borderColor={isActive ? 'complementary' : 'border'}
      bg={isActive ? 'complementary/10' : 'bg.panel'}
      color={tone === 'warning' ? 'warning' : 'primary'}
      px={4}
      py={2.5}
      fontSize="md"
      fontWeight="semibold"
      transition="border-color 0.2s, background-color 0.2s"
      _hover={{ borderColor: 'complementary', bg: 'complementary/5' }}
    >
      {label}
    </chakra.button>
  )
}
