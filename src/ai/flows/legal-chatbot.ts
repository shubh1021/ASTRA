
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

const MessageSchema = z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    filePreview: z.string().optional(),
    fileName: z.string().optional(),
});

const LegalChatbotInputSchema = z.object({
  query: z.string().describe('The user\'s current question or message.'),
  documentDataUri: z.string().optional().describe(
    "An optional document or image file provided by the user for context, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  history: z.array(MessageSchema).describe('The history of the conversation so far.'),
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
  prompt: `You are a helpful legal assistant chatbot. Your goal is to answer the user's questions accurately based on the provided conversation history and any attached documents or images.

  Conversation History:
  {{#each history}}
  {{role}}: {{content}}
  {{/each}}
  
  Current User Query: {{{query}}}
  {{#if documentDataUri}}
  The user has also provided the following file for context:
  {{media url=documentDataUri}}
  {{/if}}

  Please provide a helpful and concise response to the current user query.
  `,
});

const legalChatbotFlow = ai.defineFlow(
  {
    name: 'legalChatbotFlow',
    inputSchema: LegalChatbotInputSchema,
    outputSchema: LegalChatbotOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
