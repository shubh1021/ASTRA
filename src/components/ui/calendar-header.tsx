
"use client"

import { Button } from "./button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CalendarHeader({ title, prevButtonProps, nextButtonProps }: any) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="flex items-center gap-2">
        <Button {...prevButtonProps} variant="outline" size="icon">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button {...nextButtonProps} variant="outline" size="icon">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

    