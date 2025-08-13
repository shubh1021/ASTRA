
'use server';

/**
 * @fileOverview This file defines a Genkit flow for summarizing legal documents.
 *
 * - summarizeDocument - An async function that takes a document (as a data URI) and returns a summary of its main points.
 * - SummarizeDocumentInput - The input type for the summarizeDocument function, containing the document data URI.
 * - SummarizeDocumentOutput - The output type for the summarizeDocument function, containing the document summary.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A legal document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  jurisdiction: z.string().describe('The legal jurisdiction to consider for the summary.'),
});
export type SummarizeDocumentInput = z.infer<typeof SummarizeDocumentInputSchema>;

const SummarizeDocumentOutputSchema = z.object({
  summary: z.string().describe('A summary of the main points of the legal document.'),
});
export type SummarizeDocumentOutput = z.infer<typeof SummarizeDocumentOutputSchema>;

export async function summarizeDocument(input: SummarizeDocumentInput): Promise<SummarizeDocumentOutput> {
  return summarizeDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDocumentPrompt',
  input: {schema: SummarizeDocumentInputSchema},
  output: {schema: SummarizeDocumentOutputSchema},
  prompt: `You are a legal expert tasked with summarizing legal documents. Your summary should be contextualized for the following legal jurisdiction: {{{jurisdiction}}}.

  Please provide a concise summary of the main points of the following legal document, keeping in mind the legal framework of {{{jurisdiction}}}:

  {{media url=documentDataUri}}
  `,
});

const summarizeDocumentFlow = ai.defineFlow(
  {
    name: 'summarizeDocumentFlow',
    inputSchema: SummarizeDocumentInputSchema,
    outputSchema: SummarizeDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
