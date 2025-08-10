'use server';

/**
 * @fileOverview A flow for automatically detecting and redacting sensitive information from a document.
 *
 * - redactSensitiveData - A function that handles the redaction process.
 * - RedactSensitiveDataInput - The input type for the redactSensitiveData function.
 * - RedactSensitiveDataOutput - The return type for the redactSensitiveData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RedactSensitiveDataInputSchema = z.object({
  documentText: z.string().describe('The text content of the document to redact.'),
});
export type RedactSensitiveDataInput = z.infer<typeof RedactSensitiveDataInputSchema>;

const RedactSensitiveDataOutputSchema = z.object({
  redactedDocument: z.string().describe('The document with sensitive information redacted.'),
});
export type RedactSensitiveDataOutput = z.infer<typeof RedactSensitiveDataOutputSchema>;

export async function redactSensitiveData(input: RedactSensitiveDataInput): Promise<RedactSensitiveDataOutput> {
  return redactSensitiveDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'redactSensitiveDataPrompt',
  input: {schema: RedactSensitiveDataInputSchema},
  output: {schema: RedactSensitiveDataOutputSchema},
  prompt: `You are an AI assistant designed to redact sensitive information from legal documents to protect privacy and ensure compliance.

  Instructions:
  1.  Identify any personally identifiable information (PII) within the document, including but not limited to names, addresses, phone numbers, email addresses, social security numbers, credit card numbers, and other financial details.
  2.  Replace all identified PII with the string "[REDACTED]" to ensure it is completely removed from the document.
  3.  Maintain the original document formatting and structure, only replacing the sensitive information itself.

  Here is the document to redact:
  {{{documentText}}}

  Redacted Document:
  `,
});

const redactSensitiveDataFlow = ai.defineFlow(
  {
    name: 'redactSensitiveDataFlow',
    inputSchema: RedactSensitiveDataInputSchema,
    outputSchema: RedactSensitiveDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {redactedDocument: output!.redactedDocument};
  }
);
