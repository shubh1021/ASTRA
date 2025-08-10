
"use client"

import { CalendarGrid } from "./calendar-grid";
import { CalendarHeader } from "./calendar-header";
import { cn } from "@/lib/utils";
import { useCalendarAria } from "@/hooks/use-calendar-aria";

export function Calendar(props: any) {
  const { state, calendarProps, prevButtonProps, nextButtonProps, title } = useCalendarAria(props);

  if (!state) {
      return null;
  }

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

    