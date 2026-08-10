import { defineMessages } from 'react-intl'

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
  registerSuggestion: {
    id: 'riskRegister.registerSuggestion',
    defaultMessage: 'Register as risk',
    description: 'Turns a suggestion into a risk form',
  },
})
