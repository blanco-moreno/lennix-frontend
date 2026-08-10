import { DatePicker } from '@chakra-ui/react'

import type { Picker } from '../../date-input'

type WeekDay = Picker['weekDays'][number]
type Week = Picker['weeks'][number]
type CalendarDay = Week[number]

function DateGrid({ picker }: { picker: Picker }) {
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
        <DatePicker.TableHead>
          <DatePicker.TableRow>
            {picker.weekDays.map((weekDay: WeekDay) => (
              <DatePicker.TableHeader key={weekDay.long}>
                {weekDay.narrow}
              </DatePicker.TableHeader>
            ))}
          </DatePicker.TableRow>
        </DatePicker.TableHead>
        <DatePicker.TableBody>
          {picker.weeks.map((week: Week, weekIndex: number) => (
            <DatePicker.TableRow key={weekIndex}>
              {week.map((day: CalendarDay) => (
                <DatePicker.TableCell key={day.toString()} value={day}>
                  <DatePicker.TableCellTrigger>
                    {day.day}
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

export { DateGrid }
