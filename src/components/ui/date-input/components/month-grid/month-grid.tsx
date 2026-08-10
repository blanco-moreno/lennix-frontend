import { DatePicker } from '@chakra-ui/react'

import type { GridCell, Picker } from '../../date-input'

function MonthGrid({ picker }: { picker: Picker }) {
  return (
    <>
      <DatePicker.ViewControl>
        <DatePicker.PrevTrigger />
        <DatePicker.ViewTrigger>
          <DatePicker.RangeText />
        </DatePicker.ViewTrigger>
        <DatePicker.NextTrigger />
      </DatePicker.ViewControl>
      <DatePicker.Table>
        <DatePicker.TableBody>
          {picker
            .getMonthsGrid({ columns: 4, format: 'short' })
            .map((months: GridCell[], rowIndex: number) => (
              <DatePicker.TableRow key={rowIndex}>
                {months.map((month: GridCell) => (
                  <DatePicker.TableCell key={month.value} value={month.value}>
                    <DatePicker.TableCellTrigger>
                      {month.label}
                    </DatePicker.TableCellTrigger>
                  </DatePicker.TableCell>
                ))}
              </DatePicker.TableRow>
            ))}
        </DatePicker.TableBody>
      </DatePicker.Table>
    </>
  )
}

export { MonthGrid }
