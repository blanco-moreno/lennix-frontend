import { Stack } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { Label } from '../label'
import { Text } from '../text'

export interface FormFieldProps {
  /** Id of the control the label points at. Omit for controls with no id. */
  htmlFor?: string
  label: ReactNode
  /** Validation message, rendered under the control when present. */
  error?: string
  children: ReactNode
}

/**
 * The labelled-field block every form modal repeats: a gap-2 stack of label,
 * control and (when present) the validation message under it.
 */
export function FormField({ htmlFor, label, error, children }: FormFieldProps) {
  return (
    <Stack gap={2}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && (
        // Announced when it appears, and addressable: a control with an id
        // points at `${id}-error` through `aria-describedby`.
        <Text
          id={htmlFor ? `${htmlFor}-error` : undefined}
          role="alert"
          size="sm"
          color="error"
        >
          {error}
        </Text>
      )}
    </Stack>
  )
}
