import { DatePicker } from '@chakra-ui/react'

import type { GridCell, Picker } from '../../date-input'

function YearGrid({ picker }: { picker: Picker }) {
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
            .getYearsGrid({ columns: 4 })
            .map((years: GridCell[], rowIndex: number) => (
              <DatePicker.TableRow key={rowIndex}>
                {years.map((year: GridCell) => (
                  <DatePicker.TableCell key={year.value} value={year.value}>
                    <DatePicker.TableCellTrigger>
                      {year.label}
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

export { YearGrid }
