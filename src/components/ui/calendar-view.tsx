
"use client"

import { useCalendar } from "react-aria";
import { useCalendarState } from "react-stately";
import { createCalendar } from "@internationalized/date";
import { CalendarGrid } from "./calendar-grid";
import { CalendarHeader } from "./calendar-header";
import { cn } from "@/lib/utils";

export function Calendar(props: any) {
  const state = useCalendarState({
    ...props,
    createCalendar,
  });

  const { calendarProps, prevButtonProps, nextButtonProps, title } =
    useCalendar(props, state);

  return (
    <div {...calendarProps} className={cn("space-y-4", props.className)}>
      <CalendarHeader
        title={title}
        prevButtonProps={prevButtonProps}
        nextButtonProps={nextButtonProps}
      />
      <CalendarGrid state={state} />
    </div>
  );
}
