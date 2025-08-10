
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
});
export type LegalChatbotInput = z.infer<typeof LegalChatbotInputSchema>;

const LegalChatbotOutputSchema = z.object({
  response: z.string().describe('The AI\'s response to the user\'s query.'),
});
export type LegalChatbotOutput = z.infer<typeof LegalChatbotOutputSchema>;

export async function legalChatbot(input: LegalChatbotInput): Promise<LegalChatbotOutput> {
  const response = await legalChatbotFlow(input);
  return { response };
}

const prompt = ai.definePrompt({
  name: 'legalChatbotPrompt',
  input: {schema: LegalChatbotInputSchema},
  prompt: `You are an expert attorney providing legal advice. Your goal is to give direct, actionable answers to the user's questions based on the provided context. Do not include disclaimers about not being a lawyer.
  
  Current time: ${new Date().toISOString()}

  Conversation History:
  {{#each history}}
  {{#if name}}
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

  Please provide a direct and clear legal response to the current user query.
  `,
});

const legalChatbotFlow = ai.defineFlow(
  {
    name: 'legalChatbotFlow',
    inputSchema: LegalChatbotInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    
    const llmResponse = await prompt(input);
    
    return llmResponse.text;
  }
);
