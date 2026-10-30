import { useIntl } from 'react-intl'

import { PROJECT_CURRENCIES, type ProjectCurrency } from '@/types'

import { Select } from '../ui/select'

import { currencySelectMessages as m } from './currency-select-messages'

export interface CurrencySelectProps {
  value: ProjectCurrency
  onChange: (currency: ProjectCurrency) => void
  id?: string
  disabled?: boolean
  'aria-label'?: string
}

/**
 * Picks the one currency every amount of a project is in (ms-bk `BUD-10`).
 * Each option names the currency and its ISO 4217 code, since both read `$`.
 */
export function CurrencySelect({
  value,
  onChange,
  id,
  disabled,
  'aria-label': ariaLabel,
}: CurrencySelectProps) {
  const intl = useIntl()
  const options = PROJECT_CURRENCIES.map((currency) => ({
    value: currency,
    label: intl.formatMessage(m[currency]),
  }))

  return (
    <Select
      id={id}
      aria-label={ariaLabel}
      value={value}
      options={options}
      disabled={disabled}
      onChange={(next) => {
        const picked = PROJECT_CURRENCIES.find((c) => c === next)
        if (picked) onChange(picked)
      }}
    />
  )
}
