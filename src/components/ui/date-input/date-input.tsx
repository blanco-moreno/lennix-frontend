import {
  DatePicker,
  Icon,
  Portal,
  parseDate,
  type useDatePickerContext,
} from '@chakra-ui/react'
import { CalendarIcon } from 'lucide-react'
import { useIntl } from 'react-intl'

import { useFormatDate } from '@/i18n'

import { commonMessages } from '../../common-messages'
import { inputBase } from '../input'

import { DateGrid } from './components/date-grid'
import { MonthGrid } from './components/month-grid'
import { YearGrid } from './components/year-grid'

type Picker = ReturnType<typeof useDatePickerContext>
type GridCell = ReturnType<Picker['getMonthsGrid']>[number][number]

/**
 * `parseDate` throws on anything that is not `YYYY-MM-DD` — a datetime or a
 * typo would take the whole screen down. An unreadable value opens an empty
 * picker instead: picking a day is still the way out.
 */
function toCalendarDate(value: string | undefined) {
  if (!value) return undefined
  try {
    return parseDate(value)
  } catch {
    return undefined
  }
}

export interface DateInputProps {
  /** ISO date string (`YYYY-MM-DD`) */
  value: string | undefined
  onValueChange: (isoDate: string) => void
  /** Lands on the trigger, so a `<Label htmlFor>` still points at the control. */
  id?: string
  min?: string
  max?: string
  disabled?: boolean
  invalid?: boolean
}

function DateInput({
  value,
  onValueChange,
  id,
  min,
  max,
  disabled,
  invalid,
}: DateInputProps) {
  const intl = useIntl()
  const formatDate = useFormatDate()
  const day = toCalendarDate(value)

  return (
    <DatePicker.Root
      colorPalette="brand"
      // Without these two the picker is an English island: Zag defaults to
      // 'en-US', so the weekday and month names, the range header and the
      // selected value would read `Jul 18, 2026` inside a Spanish screen.
      // `locale` fixes the calendar's own chrome; `format` makes the trigger
      // read exactly like every other date in the app.
      locale={intl.locale}
      format={(selected) => formatDate(selected.toString())}
      value={day ? [day] : []}
      onValueChange={(details) =>
        onValueChange(details.value[0]?.toString() ?? '')
      }
      min={toCalendarDate(min)}
      max={toCalendarDate(max)}
      disabled={disabled}
      invalid={invalid}
    >
      <DatePicker.Control w="full">
        <DatePicker.Trigger
          type="button"
          id={id}
          disabled={disabled}
          aria-invalid={invalid}
          {...inputBase}
          alignItems="center"
          justifyContent="space-between"
          gap={2}
          cursor="pointer"
          textAlign="left"
        >
          <DatePicker.ValueText
            placeholder={intl.formatMessage(commonMessages.selectDate)}
          />
          <Icon as={CalendarIcon} boxSize={4} color="fg.muted" flexShrink={0} />
        </DatePicker.Trigger>
      </DatePicker.Control>
      <Portal>
        <DatePicker.Positioner>
          <DatePicker.Content>
            <DatePicker.View view="day">
              <DatePicker.Context>
                {(picker: Picker) => <DateGrid picker={picker} />}
              </DatePicker.Context>
            </DatePicker.View>
            <DatePicker.View view="month">
              <DatePicker.Context>
                {(picker: Picker) => <MonthGrid picker={picker} />}
              </DatePicker.Context>
            </DatePicker.View>
            <DatePicker.View view="year">
              <DatePicker.Context>
                {(picker: Picker) => <YearGrid picker={picker} />}
              </DatePicker.Context>
            </DatePicker.View>
          </DatePicker.Content>
        </DatePicker.Positioner>
      </Portal>
    </DatePicker.Root>
  )
}

export { DateInput }
export type { GridCell, Picker }
