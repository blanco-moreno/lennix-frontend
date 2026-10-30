import { defineMessages } from 'react-intl'

export const budgetStepMessages = defineMessages({
  projectBudgetLabel: {
    id: 'budgetStep.projectBudgetLabel',
    defaultMessage: 'Project budget',
    description: 'Label of the project-level budget input',
  },
  fileBudgetAppliedTitle: {
    id: 'budgetStep.fileBudgetAppliedTitle',
    defaultMessage: 'Amounts taken from the file',
    description: "Headline when the file's costs pre-filled the budget",
  },
  fileBudgetAppliedBody: {
    id: 'budgetStep.fileBudgetAppliedBody',
    defaultMessage:
      '{source, select, baseline {Each phase starts with the baseline cost the file states.} budgeted {Each phase starts with the budgeted cost the file states.} other {Each phase starts with the cost the file states.}} Check them before you confirm; any change is yours.',
    description:
      'Where the pre-filled amounts came from; source is the file cost column kind',
  },
  fileBudgetNetNote: {
    id: 'budgetStep.fileBudgetNetNote',
    defaultMessage:
      'Lennix keeps budgets net, without VAT. The file does not say whether its amounts include VAT: if they do, adjust them before you confirm.',
    description:
      'The file cost columns never state whether VAT is included; budgets are stored net',
  },
  fileBudgetUnread: {
    id: 'budgetStep.fileBudgetUnread',
    defaultMessage:
      '{count, plural, one {# amount in the file could not be read with certainty and was left empty.} other {# amounts in the file could not be read with certainty and were left empty.}}',
    description: 'Cost cells the parser declined to read rather than guess',
  },
  fileBudgetOutOfRangeTitle: {
    id: 'budgetStep.fileBudgetOutOfRangeTitle',
    defaultMessage: "The file's amounts are too large to store",
    description: 'Headline when the file budget exceeds what Lennix stores',
  },
  fileBudgetOutOfRangeBody: {
    id: 'budgetStep.fileBudgetOutOfRangeBody',
    defaultMessage:
      'Lennix stores amounts up to {max, number}. Nothing was filled in; enter the budget by hand.',
    description:
      'Recovery guidance when the file budget is too large; max is the limit',
  },
  currencyLabel: {
    id: 'budgetStep.currencyLabel',
    defaultMessage: 'Currency',
    description: "Label of the project's currency picker on the budget step",
  },
  currencyHint: {
    id: 'budgetStep.currencyHint',
    defaultMessage:
      'Every amount of this project is in this currency. Lennix does not convert between currencies.',
    description:
      'Helper under the currency picker; amounts are never converted',
  },
  fileBudgetCurrencyUnknown: {
    id: 'budgetStep.fileBudgetCurrencyUnknown',
    defaultMessage:
      'The file does not say which currency its amounts are in: check the currency above before you confirm.',
    description:
      'The file costs carry no currency mark (or a bare $), so the reviewer picks it',
  },
  fileBudgetForeignTitle: {
    id: 'budgetStep.fileBudgetForeignTitle',
    defaultMessage:
      "The file's amounts are in {currency, select, CLF {UF} other {{currency}}}",
    description:
      'Headline when the file costs are in a currency no project is kept in; currency is ISO 4217 (CLF is the UF)',
  },
  fileBudgetForeignBody: {
    id: 'budgetStep.fileBudgetForeignBody',
    defaultMessage:
      'Lennix keeps each project in Chilean pesos or US dollars and does not convert. Nothing was filled in: convert the amounts and enter them below.',
    description: 'Recovery guidance when the file costs are in UF',
  },
  currencyMismatchTitle: {
    id: 'budgetStep.currencyMismatchTitle',
    defaultMessage:
      "The file's amounts are in {fileCurrency}, and this project is in {currency}",
    description:
      'Headline when the reviewer picked a currency other than the one the file names; both are ISO 4217 codes',
  },
  currencyMismatchBody: {
    id: 'budgetStep.currencyMismatchBody',
    defaultMessage:
      'Lennix does not convert them. Convert the amounts below before you confirm, or choose {fileCurrency}.',
    description: 'Recovery guidance for a currency mismatch',
  },
  emptyTitle: {
    id: 'budgetStep.emptyTitle',
    defaultMessage: 'No main activities to budget',
    description: 'Shown when the draft has no main activities',
  },
})
