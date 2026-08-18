import { defineMessages, type MessageDescriptor } from 'react-intl'

import type { RiskSuggestionCode } from '@/types'

/** Catalog for the risk suggestions card (system proposes, human decides). */
export const riskSuggestionsMessages = defineMessages({
  suggestionsTitle: {
    id: 'riskRegister.suggestionsTitle',
    defaultMessage: 'Worth registering',
    description: 'Heading of the risk suggestions',
  },
  suggestionsBody: {
    id: 'riskRegister.suggestionsBody',
    defaultMessage:
      'Delayed critical activities. These are suggestions — nothing is registered until you say so.',
    description: 'Body of the risk suggestions',
  },
  suggestionDelay: {
    id: 'riskRegister.suggestionDelay',
    defaultMessage: '{days, plural, one {# day late} other {# days late}}',
    description: 'Delay of a suggested risk',
  },
  suggestionCauseUnknown: {
    id: 'riskRegister.suggestionCause.unknown',
    defaultMessage: 'Suggested by the schedule',
    description: 'Cause label for a suggestion code this build does not know',
  },
  registerSuggestion: {
    id: 'riskRegister.registerSuggestion',
    defaultMessage: 'Register as risk',
    description: 'Turns a suggestion into a risk form',
  },
})

/**
 * One label per backend suggestion code (RSK-3). A code added there is a type
 * error here rather than a blank label; a code this build predates falls back
 * to `suggestionCauseUnknown` at render time.
 */
export const riskSuggestionCauseMessages: Record<
  RiskSuggestionCode,
  MessageDescriptor
> = defineMessages({
  critical_path_delay: {
    id: 'riskRegister.suggestionCause.critical_path_delay',
    defaultMessage: 'On the critical path',
    description: 'Cause of a suggestion: a delayed critical-path activity',
  },
}) as Record<RiskSuggestionCode, MessageDescriptor>
