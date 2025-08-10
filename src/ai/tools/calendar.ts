
'use server';
/**
 * @fileOverview Genkit tools for interacting with Google Calendar.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { listEvents as apiListEvents, createEvent as apiCreateEvent, deleteEvent as apiDeleteEvent } from '@/services/google-calendar';

export const listCalendarEvents = ai.defineTool(
  {
    name: 'listCalendarEvents',
    description: 'List upcoming events from the user\'s primary Google Calendar.',
    inputSchema: z.object({
        maxResults: z.number().optional().default(10).describe('Maximum number of events to return.'),
    }),
    outputSchema: z.any(),
  },
  async (input, accessToken?: string) => {
    if (!accessToken) return "Error: User is not authenticated. Ask the user to connect their Google Calendar first.";
    try {
      return await apiListEvents(accessToken, input.maxResults);
    } catch (e: any) {
      return `Error listing events: ${e.message}`;
    }
  }
);

export const createCalendarEvent = ai.defineTool(
  {
    name: 'createCalendarEvent',
    description: 'Create a new event on the user\'s primary Google Calendar.',
    inputSchema: z.object({
      summary: z.string().describe('The title or summary of the event.'),
      startDateTime: z.string().datetime().describe('The start date and time in ISO 8601 format (e.g., "2024-08-15T10:00:00Z").'),
      endDateTime: z.string().datetime().describe('The end date and time in ISO 8601 format (e.g., "2024-08-15T11:00:00Z").'),
      description: z.string().optional().describe('A description of the event.'),
    }),
    outputSchema: z.any(),
  },
  async (input, accessToken?: string) => {
    if (!accessToken) return "Error: User is not authenticated. Ask the user to connect their Google Calendar first.";
    try {
      const result = await apiCreateEvent(accessToken, input.summary, input.startDateTime, input.endDateTime, input.description);
      return { success: true, event: { id: result.id, summary: result.summary, start: result.start.dateTime } };
    } catch (e: any) {
      return `Error creating event: ${e.message}`;
    }
  }
);

export const deleteCalendarEvent = ai.defineTool(
  {
    name: 'deleteCalendarEvent',
    description: 'Delete an event from the user\'s primary Google Calendar. To get the event ID, you must first list the events.',
    inputSchema: z.object({
      eventId: z.string().describe('The unique ID of the event to delete.'),
    }),
    outputSchema: z.any(),
  },
  async (input, accessToken?: string) => {
    if (!accessToken) return "Error: User is not authenticated. Ask the user to connect their Google Calendar first.";
    try {
      return await apiDeleteEvent(accessToken, input.eventId);
    } catch (e: any) {
      return `Error deleting event: ${e.message}`;
    }
  }
);
