
"use client"

import { useRef } from "react";
import { useCalendarCell } from "react-aria";
import { isToday as isTodayUtil } from "@internationalized/date";
import { cn } from "@/lib/utils";
import { useCalendarAria } from "@/hooks/use-calendar-aria";

export function CalendarCell({ state, date }: any) {
  const ref = useRef(null);
  const { locale } = useCalendarAria({});

  const {
    cellProps,
    buttonProps,
    isSelected,
    isOutsideVisibleRange,
    isDisabled,
    formattedDate,
    isFocused,
  } = useCalendarCell({ date }, state, ref);

  const isToday = isTodayUtil(date, "UTC");

  const dayOfWeek = locale ? date.getDayOfWeek(locale) : -1;

  return (
    <td
      {...cellProps}
      className={cn(
        "py-1 text-center",
        isToday && "bg-secondary",
        (dayOfWeek === 0 || dayOfWeek === 6) && "text-muted-foreground",
      )}
    >
      <div
        {...buttonProps}
        ref={ref}
        hidden={isOutsideVisibleRange}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full text-sm font-normal outline-none",
          isFocused && "ring-2 ring-ring ring-offset-2",
          isSelected && "bg-primary text-primary-foreground",
          !isSelected && !isDisabled && "hover:bg-accent hover:text-accent-foreground",
          isDisabled && "text-muted-foreground opacity-50 cursor-not-allowed",
        )}
      >
        {formattedDate}
      </div>
    </td>
  );
}

    