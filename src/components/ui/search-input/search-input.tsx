import { Box, type BoxProps } from '@chakra-ui/react'
import { Search } from 'lucide-react'

import { Input } from '../input'
import { InputGroup } from '../input-group'

interface SearchInputProps extends Omit<BoxProps, 'onChange' | 'children'> {
  value: string
  /** Receives the text directly — no unwrapping the change event per caller. */
  onChange: (value: string) => void
  placeholder?: string
}

/**
 * The search field every listing filter bar carries: a full-width input with a
 * leading search icon. Callers pass the value, the change handler and the
 * placeholder; layout props (`maxW`, `w`) pass straight through to the group.
 */
export function SearchInput({
  value,
  onChange,
  placeholder,
  ...groupProps
}: SearchInputProps) {
  return (
    <InputGroup startIcon={<Box as={Search} boxSize={4} />} {...groupProps}>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </InputGroup>
  )
}
