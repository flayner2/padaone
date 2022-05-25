import { useCalendarGrid } from '@react-aria/calendar';
import {
  startOfWeek,
  getWeeksInMonth,
  endOfMonth,
} from '@internationalized/date';
import { useLocale } from '@react-aria/i18n';
import { CalendarCell } from './CalendarCell';

export function CalendarGrid({ state, offset = {} }) {
  let { locale } = useLocale();
  let startDate = state.visibleRange.start.add(offset);
  let endDate = endOfMonth(startDate);
  let { gridProps, headerProps, weekDays } = useCalendarGrid(
    {
      startDate,
      endDate,
    },
    state
  );

  // Find the start date of the grid, which is the beginning
  // of the week the month starts in. Also get the number of
  // weeks in the month so we can render the proper number of rows.
  let firstDate = startOfWeek(startDate, locale);
  let weeksInMonth = getWeeksInMonth(startDate, locale);

  return (
    <table {...gridProps}>
      <thead {...headerProps}>
        <tr>
          {weekDays.map((day, index) => (
            <th key={index}>{day}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...new Array(weeksInMonth).keys()].map((weekIndex) => (
          <tr key={weekIndex}>
            {[...new Array(7).keys()].map((dayIndex) => (
              <CalendarCell
                key={dayIndex}
                state={state}
                date={firstDate.add({ weeks: weekIndex, days: dayIndex })}
                currentMonth={startDate}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
