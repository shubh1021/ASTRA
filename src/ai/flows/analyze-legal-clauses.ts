
'use server';

/**
 * @fileOverview A legal clause analysis AI agent.
 *
 * - analyzeLegalClauses - A function that handles the legal clause analysis process.
 * - AnalyzeLegalClausesInput - The input type for the analyzeLegalClauses function.
 * - AnalyzeLegalClausesOutput - The return type for the analyzeLegalClauses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeLegalClausesInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the legal document to analyze.'),
  jurisdiction: z.string().describe('The legal jurisdiction to consider for the analysis.'),
});
export type AnalyzeLegalClausesInput = z.infer<typeof AnalyzeLegalClausesInputSchema>;

const AnalyzeLegalClausesOutputSchema = z.object({
  clauseAnalysis: z.array(
    z.object({
      clause: z.string().describe('The specific legal clause being analyzed.'),
      riskLevel: z
        .enum(['low', 'medium', 'high'])
        .describe('The risk level associated with this clause.'),
      explanation: z
        .string()
        .describe('An explanation of the potential risks or unusual terms in the clause.'),
    })
  ).describe('An analysis of the legal clauses in the document.'),
});
export type AnalyzeLegalClausesOutput = z.infer<typeof AnalyzeLegalClausesOutputSchema>;

export async function analyzeLegalClauses(input: AnalyzeLegalClausesInput): Promise<AnalyzeLegalClausesOutput> {
  return analyzeLegalClausesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeLegalClausesPrompt',
  input: {schema: AnalyzeLegalClausesInputSchema},
  output: {schema: AnalyzeLegalClausesOutputSchema},
  prompt: `You are an AI legal assistant specializing in analyzing legal clauses to identify potential risks or unusual terms.

  Your analysis must be tailored to the laws and regulations of the following jurisdiction: {{{jurisdiction}}}.

  Analyze the following legal document and identify potentially risky or unusual clauses. For each clause, determine the risk level (low, medium, or high) and provide a detailed explanation based on the specified jurisdiction.

  Document Text: {{{documentText}}}
  `,
});

const analyzeLegalClausesFlow = ai.defineFlow(
  {
    name: 'analyzeLegalClausesFlow',
    inputSchema: AnalyzeLegalClausesInputSchema,
    outputSchema: AnalyzeLegalClausesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
