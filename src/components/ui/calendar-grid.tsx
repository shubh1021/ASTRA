
"use client"

import { useCalendarGrid } from "react-aria";
import { CalendarCell } from "./calendar-cell";
import { useCalendarAria } from "@/hooks/use-calendar-aria";

export function CalendarGrid({ state, ...props }: any) {
  const { locale } = useCalendarAria({});
  const { gridProps, headerProps, weekDays } = useCalendarGrid(props, state);

  const weeksInMonth = locale ? state.getWeeksInMonth(locale) : 0;

  if(!locale || weeksInMonth === 0) return null;

  return (
    <table {...gridProps} className="w-full border-collapse">
      <thead {...headerProps}>
        <tr>
          {weekDays.map((day, index) => (
            <th key={index} className="pb-4 text-xs font-normal text-muted-foreground">
              {day}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...new Array(weeksInMonth).keys()].map((weekIndex) => (
          <tr key={weekIndex}>
            {state
              .getDatesInWeek(weekIndex, locale)
              .map((date: any, i: number) =>
                date ? (
                  <CalendarCell key={i} state={state} date={date} />
                ) : (
                  <td key={i} />
                )
              )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

    