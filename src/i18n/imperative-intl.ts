import type { IntlShape, MessageDescriptor } from 'react-intl'

/**
 * Bridge that lets code outside the React tree translate strings.
 * For genuinely non-React call sites only — inside components use `useIntl()`.
 */
let currentIntl: IntlShape | null = null

export function setImperativeIntl(intl: IntlShape | null): void {
  currentIntl = intl
}

type TranslatableDescriptor = MessageDescriptor & { defaultMessage: string }

/**
 * Format a message descriptor from outside React. Before the provider mounts
 * (or in tests that never render it) the descriptor's `defaultMessage` is used.
 */
export function translate(descriptor: TranslatableDescriptor): string {
  return currentIntl
    ? currentIntl.formatMessage(descriptor)
    : descriptor.defaultMessage
}
