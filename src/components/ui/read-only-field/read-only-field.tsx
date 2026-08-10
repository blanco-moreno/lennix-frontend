import { Box } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { Text } from '../text'

export interface ReadOnlyFieldProps {
  label: ReactNode
  children: ReactNode
}

/**
 * A fact the page shows but no one edits here: caption above value.
 *
 * Not a `<Label>` — that renders a `<label>`, which promises a form control
 * that read-only data does not have, and a screen reader announces the
 * caption as one. `<dt>/<dd>` says exactly this instead.
 */
export function ReadOnlyField({ label, children }: ReadOnlyFieldProps) {
  return (
    <Box as="dl" m={0}>
      <Box as="dt">
        <Text size="sm" color="muted">
          {label}
        </Text>
      </Box>
      <Box as="dd" m={0} mt={1}>
        {/* Plain values get the page's body style; a badge or a row of them
            is already styled and must not be nested inside a `<p>`. */}
        {typeof children === 'string' || typeof children === 'number' ? (
          <Text>{children}</Text>
        ) : (
          children
        )}
      </Box>
    </Box>
  )
}
