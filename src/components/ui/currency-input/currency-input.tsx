import { InputGroup, Text } from '@chakra-ui/react'
import { forwardRef, type ComponentProps } from 'react'
import { NumericFormat, type NumberFormatValues } from 'react-number-format'

import {
  currencyFractionDigits,
  currencyLocale,
  currencySymbol,
  DEFAULT_CURRENCY,
} from '@/utils'

import { Input } from '../input'

type NumberInputValueChangeDetails = { value: string; valueAsNumber: number }

function localeSeparators(locale: string) {
  const parts = new Intl.NumberFormat(locale).formatToParts(1234.5)
  return {
    thousandSeparator: parts.find((p) => p.type === 'group')?.value ?? ',',
    decimalSeparator: parts.find((p) => p.type === 'decimal')?.value ?? '.',
  }
}

export interface CurrencyInputProps extends Omit<
  ComponentProps<typeof Input>,
  'value' | 'onChange' | 'defaultValue' | 'type'
> {
  value: string | undefined
  onValueChange: (details: NumberInputValueChangeDetails) => void
  /** ISO 4217; sets the symbol, the separators and the decimals. */
  currency?: string
  /** Overrides the currency's own market locale (`currencyLocale`). */
  locale?: string
  min?: number
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput(
    {
      value,
      onValueChange,
      currency = DEFAULT_CURRENCY,
      locale = currencyLocale(currency),
      min = 0,
      ...rest
    },
    ref,
  ) {
    const { thousandSeparator, decimalSeparator } = localeSeparators(locale)
    const decimals = currencyFractionDigits(currency)

    const handleValueChange = (values: NumberFormatValues) => {
      onValueChange({
        value: values.value,
        valueAsNumber: values.floatValue ?? 0,
      })
    }

    return (
      <InputGroup
        startElement={
          <Text color="fg.muted" fontSize="sm">
            {currencySymbol(locale, currency)}
          </Text>
        }
      >
        <NumericFormat
          customInput={Input}
          getInputRef={ref}
          value={value ?? ''}
          valueIsNumericString
          onValueChange={handleValueChange}
          thousandSeparator={thousandSeparator}
          decimalSeparator={decimalSeparator}
          allowedDecimalSeparators={['.', ',']}
          decimalScale={decimals}
          fixedDecimalScale
          allowNegative={min < 0}
          isAllowed={({ floatValue }) =>
            floatValue === undefined || floatValue >= min
          }
          placeholder={
            decimals > 0 ? `0${decimalSeparator}${'0'.repeat(decimals)}` : '0'
          }
          textAlign="right"
          {...rest}
        />
      </InputGroup>
    )
  },
)

export { CurrencyInput }
