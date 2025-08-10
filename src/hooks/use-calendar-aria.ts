
"use client"

import { useCalendar, useLocale } from "react-aria";
import { useCalendarState } from "react-stately";
import { createCalendar } from "@internationalized/date";
import { useState, useEffect } from "react";

// This hook safely initializes react-aria's calendar hooks
// only after the component has mounted on the client.
export function useCalendarAria(props: any) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const { locale } = useLocale();

    const state = useCalendarState({
        ...props,
        locale,
        createCalendar,
    });

    const { calendarProps, prevButtonProps, nextButtonProps, title } = useCalendar(props, state);
    
    // Only return the calendar data once the component is mounted and locale is available
    if (!isMounted) {
        return { 
            state: null, 
            calendarProps: {}, 
            prevButtonProps: { isDisabled: true }, 
            nextButtonProps: { isDisabled: true }, 
            title: '',
            locale: null,
        };
    }

    return { state, calendarProps, prevButtonProps, nextButtonProps, title, locale };
}

    