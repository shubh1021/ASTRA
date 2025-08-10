
'use server';

/**
 * @fileOverview A flow to retrieve Google Calendar events.
 *
 * - getCalendarEvents - Fetches upcoming events for an authenticated user.
 * - GetCalendarEventsInput - The input type for the flow.
 * - GetCalendarEventsOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { listEvents } from '@/services/google-calendar';

const GetCalendarEventsInputSchema = z.object({
  accessToken: z.string().describe('The Google Calendar access token.'),
  maxResults: z.number().optional().default(20).describe('Maximum number of events to return.'),
});
export type GetCalendarEventsInput = z.infer<typeof GetCalendarEventsInputSchema>;

const GetCalendarEventsOutputSchema = z.object({
  events: z.array(z.object({
    id: z.string(),
    summary: z.string(),
    start: z.string(),
    end: z.string(),
  })).describe('A list of upcoming calendar events.'),
});
export type GetCalendarEventsOutput = z.infer<typeof GetCalendarEventsOutputSchema>;

export async function getCalendarEvents(input: GetCalendarEventsInput): Promise<GetCalendarEventsOutput> {
  return getCalendarEventsFlow(input);
}

const getCalendarEventsFlow = ai.defineFlow(
  {
    name: 'getCalendarEventsFlow',
    inputSchema: GetCalendarEventsInputSchema,
    outputSchema: GetCalendarEventsOutputSchema,
  },
  async ({ accessToken, maxResults }) => {
    try {
      const events = await listEvents(accessToken, maxResults);
      return { events };
    } catch (e: any) {
      console.error("Error in getCalendarEventsFlow:", e);
      // Re-throw the error to be caught by the calling client
      throw new Error(`Failed to retrieve calendar events: ${e.message}`);
    }
  }
);
