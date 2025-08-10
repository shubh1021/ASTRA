
'use server';

/**
 * @fileOverview A legal chatbot that can answer questions with multimodal context.
 *
 * - legalChatbot - A function that handles a chatbot conversation turn.
 * - LegalChatbotInput - The input type for the legalChatbot function.
 * - LegalChatbotOutput - The return type for the legalChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { listCalendarEvents, createCalendarEvent, deleteCalendarEvent } from '@/ai/tools/calendar';

const MessageSchema = z.object({
    role: z.enum(['user', 'assistant', 'tool']),
    content: z.string(),
    filePreview: z.string().optional(),
    fileName: z.string().optional(),
    name: z.string().optional(), // For tool requests/responses
});

const LegalChatbotInputSchema = z.object({
  query: z.string().describe('The user\'s current question or message.'),
  documentDataUri: z.string().optional().describe(
    "An optional document or image file provided by the user for context, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  history: z.array(MessageSchema).describe('The history of the conversation so far.'),
  accessToken: z.string().optional().describe('The Google Calendar access token.'),
});
export type LegalChatbotInput = z.infer<typeof LegalChatbotInputSchema>;

const LegalChatbotOutputSchema = z.object({
  response: z.string().describe('The AI\'s response to the user\'s query.'),
});
export type LegalChatbotOutput = z.infer<typeof LegalChatbotOutputSchema>;

export async function legalChatbot(input: LegalChatbotInput): Promise<LegalChatbotOutput> {
  return legalChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'legalChatbotPrompt',
  input: {schema: LegalChatbotInputSchema},
  output: {schema: LegalChatbotOutputSchema},
  tools: [listCalendarEvents, createCalendarEvent, deleteCalendarEvent],
  prompt: `You are an expert attorney providing legal advice. Your goal is to give direct, actionable answers to the user's questions based on the provided context. Do not include disclaimers about not being a lawyer.

  You also have the ability to manage the user's Google Calendar if they have provided an access token. You can list, create, and delete calendar events.
  
  Current time: ${new Date().toISOString()}

  Conversation History:
  {{#each history}}
  {{#if (eq role 'tool')}}
  Tool Response ({{name}}): {{content}}
  {{else}}
  {{role}}: {{content}}
  {{/if}}
  {{/each}}
  
  Current User Query: {{{query}}}
  {{#if documentDataUri}}
  The user has also provided the following file for context:
  {{media url=documentDataUri}}
  {{/if}}

  Please provide a direct and clear legal response to the current user query, or perform the requested calendar action.
  `,
});

const legalChatbotFlow = ai.defineFlow(
  {
    name: 'legalChatbotFlow',
    inputSchema: LegalChatbotInputSchema,
    outputSchema: LegalChatbotOutputSchema,
  },
  async (input) => {
    
    const llmResponse = await prompt(input);
    const toolCalls = llmResponse.toolCalls();

    if (toolCalls.length > 0) {
        const toolResults = [];
        for (const call of toolCalls) {
            let output;
            if (call.tool === 'listCalendarEvents') {
                output = await listCalendarEvents(call.input, input.accessToken);
            } else if (call.tool === 'createCalendarEvent') {
                output = await createCalendarEvent(call.input, input.accessToken);
            } else if (call.tool === 'deleteCalendarEvent') {
                output = await deleteCalendarEvent(call.input, input.accessToken);
            } else {
                output = "Unknown tool";
            }
            toolResults.push({
                call,
                output,
            });
        }

        const finalResponse = await llmResponse.continue(toolResults);
        return { response: finalResponse.text };

    } else {
         return { response: llmResponse.text };
    }
  }
);
