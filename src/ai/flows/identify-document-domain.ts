'use server';

/**
 * @fileOverview An AI flow to identify the legal domain of one or more documents.
 *
 * - identifyDocumentDomain - A function that analyzes document text and returns its legal domain.
 * - IdentifyDocumentDomainInput - The input type for the identifyDocumentDomain function.
 * - IdentifyDocumentDomainOutput - The return type for the identifyDocumentDomain function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const POSSIBLE_DOMAINS = [
    "corporate", "tax", "ip", "litigation", "family", "real_estate", "environment"
] as const;


const DocumentContentSchema = z.object({
  id: z.union([z.string(), z.number()]),
  text: z.string().describe('The text content of the legal document to analyze.'),
});

const IdentifyDocumentDomainInputSchema = z.object({
  documents: z.array(DocumentContentSchema)
});
export type IdentifyDocumentDomainInput = z.infer<typeof IdentifyDocumentDomainInputSchema>;

const IdentifiedDomainSchema = z.object({
    documentId: z.union([z.string(), z.number()]),
    domain: z
        .enum(POSSIBLE_DOMAINS)
        .describe('The identified legal domain of the document.'),
});

const IdentifyDocumentDomainOutputSchema = z.object({
  results: z.array(IdentifiedDomainSchema)
});
export type IdentifyDocumentDomainOutput = z.infer<typeof IdentifyDocumentDomainOutputSchema>;

export async function identifyDocumentDomain(input: IdentifyDocumentDomainInput): Promise<IdentifyDocumentDomainOutput> {
  return identifyDocumentDomainFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyDocumentDomainPrompt',
  input: {schema: IdentifyDocumentDomainInputSchema},
  output: {schema: IdentifyDocumentDomainOutputSchema},
  prompt: `You are an AI legal assistant specializing in classifying legal documents. For each document provided below, analyze its text and identify its primary legal domain.
  
  The domain for each document must be one of the following exact values: ${POSSIBLE_DOMAINS.join(", ")}.

  Documents:
  {{#each documents}}
  ---
  Document ID: {{id}}
  Text: {{{text}}}
  ---
  {{/each}}

  Based on the text of each document, determine the most appropriate domain and return the results as an array of objects, each with a 'documentId' and its identified 'domain'.
  `,
});

const identifyDocumentDomainFlow = ai.defineFlow(
  {
    name: 'identifyDocumentDomainFlow',
    inputSchema: IdentifyDocumentDomainInputSchema,
    outputSchema: IdentifyDocumentDomainOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
