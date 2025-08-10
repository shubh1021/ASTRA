'use server';

/**
 * @fileOverview An AI flow to identify the legal domain of a document.
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


const IdentifyDocumentDomainInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the legal document to analyze.'),
});
export type IdentifyDocumentDomainInput = z.infer<typeof IdentifyDocumentDomainInputSchema>;

const IdentifyDocumentDomainOutputSchema = z.object({
  domain: z
    .enum(POSSIBLE_DOMAINS)
    .describe('The identified legal domain of the document.'),
});
export type IdentifyDocumentDomainOutput = z.infer<typeof IdentifyDocumentDomainOutputSchema>;

export async function identifyDocumentDomain(input: IdentifyDocumentDomainInput): Promise<IdentifyDocumentDomainOutput> {
  return identifyDocumentDomainFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyDocumentDomainPrompt',
  input: {schema: IdentifyDocumentDomainInputSchema},
  output: {schema: IdentifyDocumentDomainOutputSchema},
  prompt: `You are an AI legal assistant specializing in classifying legal documents. Analyze the following document text and identify its primary legal domain.
  
  The domain must be one of the following exact values: ${POSSIBLE_DOMAINS.join(", ")}.

  Document Text: 
  ---
  {{{documentText}}}
  ---

  Based on the text, determine the most appropriate domain.
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
