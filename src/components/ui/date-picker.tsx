
"use client"

import { useRef } from "react";
import { useDateFieldState } from "react-stately";
import { useDateField, useDateSegment, useTimeField } from "react-aria";
import { createCalendar, DateValue } from "@internationalized/date";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "./calendar-view";

function DateSegment({ segment, state }: { segment: any; state: any }) {
  const ref = useRef(null);
  const { segmentProps } = useDateSegment(segment, state, ref);

  return (
    <div
      {...segmentProps}
      ref={ref}
      className={cn(
        "focus:rounded-[2px] focus:bg-accent focus:text-accent-foreground focus:outline-none",
        segment.isPlaceholder && "text-muted-foreground"
      )}
    >
      {segment.text}
    </div>
  );
}

function DateField(props: any) {
  const state = useDateFieldState({
    ...props,
    createCalendar,
  });

  const ref = useRef(null);
  const { fieldProps } = useDateField(props, state, ref);

  return (
    <div
      {...fieldProps}
      ref={ref}
      className={cn(
        "inline-flex h-10 w-full flex-1 items-center rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background",
        props.className
      )}
    >
      {state.segments.map((segment, i) => (
        <DateSegment key={i} segment={segment} state={state} />
      ))}
    </div>
  );
}

export function DatePicker(props: any) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !props.value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {props.value ? (
            props.value.toString()
          ) : (
            <span>{props.label}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar {...props} />
      </PopoverContent>
    </Popover>
  );
}

export function TimeField(props: {
  value: DateValue | null;
  onChange: (value: DateValue) => void;
  label?: string;
}) {
  const state = useDateFieldState({
    ...props,
    createCalendar,
  });

  const ref = useRef(null);
  const { labelProps, fieldProps } = useTimeField(props, state, ref);

  return (
    <div className="flex flex-col items-start">
      <div {...labelProps} className="text-sm font-medium">
        {props.label}
      </div>
      <div
        {...fieldProps}
        ref={ref}
        className="inline-flex h-10 w-full flex-1 items-center rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      >
        {state.segments.map((segment, i) => (
          <DateSegment key={i} segment={segment} state={state} />
        ))}
      </div>
    </div>
  );
}
