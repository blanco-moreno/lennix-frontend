import { Box, type BoxProps } from '@chakra-ui/react'
import * as React from 'react'

interface InputGroupProps extends Omit<BoxProps, 'children'> {
  /** Decorative leading icon (non-interactive). */
  startIcon?: React.ReactNode
  /** Interactive trailing element, e.g. a password show/hide toggle button. */
  endIcon?: React.ReactNode
  /** A single `<Input>`. */
  children: React.ReactElement
}

// Full-width icon input: positions a leading and/or trailing icon over the
// input and injects the matching padding so text never sits under an icon.
// Clones the single child to add the icon-side padding.
export function InputGroup({
  startIcon,
  endIcon,
  children,
  ...boxProps
}: InputGroupProps) {
  const childProps = children.props as { pl?: unknown; pr?: unknown }
  const child = React.cloneElement(children, {
    pl: startIcon ? 10 : childProps.pl,
    // 12 (48px), not 10: the trailing slot is interactive, so it has to hold a
    // 44px target (`sizes.touch`) plus its inset without the text running under it.
    pr: endIcon ? 12 : childProps.pr,
  } as Partial<typeof childProps>)

  return (
    <Box position="relative" w="full" {...boxProps}>
      {startIcon && (
        <Box
          position="absolute"
          insetY={0}
          left={0}
          pl={3}
          display="flex"
          alignItems="center"
          color="fg.muted"
          pointerEvents="none"
          zIndex={2}
        >
          {startIcon}
        </Box>
      )}
      {child}
      {endIcon && (
        <Box
          position="absolute"
          insetY={0}
          right={0}
          pr={1}
          display="flex"
          alignItems="center"
          zIndex={2}
        >
          {endIcon}
        </Box>
      )}
    </Box>
  )
}
