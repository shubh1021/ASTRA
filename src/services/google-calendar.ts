
'use server';

const CALENDAR_API_URL = 'https://www.googleapis.com/calendar/v3';

async function fetchFromCalendarAPI(endpoint: string, accessToken: string, options: RequestInit = {}) {
    if (!accessToken) {
        throw new Error("Google Calendar API access token is required.");
    }

    const response = await fetch(`${CALENDAR_API_URL}${endpoint}`, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Google Calendar API Error:", errorData);
        throw new Error(`Google Calendar API request failed: ${errorData.error?.message || response.statusText}`);
    }

    // For 204 No Content responses (like event deletion)
    if (response.status === 204) {
        return null;
    }

    return response.json();
}

export async function listEvents(accessToken: string, maxResults = 10) {
    const timeMin = new Date().toISOString();
    const endpoint = `/calendars/primary/events?maxResults=${maxResults}&timeMin=${timeMin}&singleEvents=true&orderBy=startTime`;
    const data = await fetchFromCalendarAPI(endpoint, accessToken, { method: 'GET' });
    return data.items.map((event: any) => ({
        id: event.id,
        summary: event.summary,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
    }));
}

export async function createEvent(accessToken: string, summary: string, startDateTime: string, endDateTime: string, description?: string) {
    const endpoint = '/calendars/primary/events';
    const event = {
        summary,
        description,
        start: {
            dateTime: startDateTime,
            timeZone: 'UTC',
        },
        end: {
            dateTime: endDateTime,
            timeZone: 'UTC',
        },
    };
    return await fetchFromCalendarAPI(endpoint, accessToken, {
        method: 'POST',
        body: JSON.stringify(event),
    });
}

export async function deleteEvent(accessToken: string, eventId: string) {
    const endpoint = `/calendars/primary/events/${eventId}`;
    await fetchFromCalendarAPI(endpoint, accessToken, { method: 'DELETE' });
    return { success: true, message: `Event ${eventId} deleted successfully.` };
}
