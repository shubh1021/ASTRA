
'use server';

/**
 * @fileOverview An AI flow that identifies a document's domain and assigns it to the best lawyer.
 *
 * - optimizationAssistant - A function that handles the full optimization process.
 * - OptimizationAssistantInput - The input type for the optimizationAssistant function.
 * - OptimizationAssistantOutput - The return type for the optimizationAssistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { identifyDocumentDomain } from './identify-document-domain';
import { processDocuments, AssignmentResult } from '@/services/optimization';


const OptimizationAssistantInputSchema = z.object({
  documentText: z.string().describe('The text content of the legal document to analyze and assign.'),
});
export type OptimizationAssistantInput = z.infer<typeof OptimizationAssistantInputSchema>;


const OptimizationAssistantOutputSchema = z.object({
    assignment: z.object({
        docDomain: z.string().describe('The identified legal domain of the document.'),
        lawyerName: z.string().describe('The name of the lawyer the document was assigned to.'),
        newLoad: z.number().describe("The assigned lawyer's new total number of documents."),
    })
});
export type OptimizationAssistantOutput = z.infer<typeof OptimizationAssistantOutputSchema>;


export async function optimizationAssistant(input: OptimizationAssistantInput): Promise<OptimizationAssistantOutput> {
  return optimizationAssistantFlow(input);
}


const optimizationAssistantFlow = ai.defineFlow(
  {
    name: 'optimizationAssistantFlow',
    inputSchema: OptimizationAssistantInputSchema,
    outputSchema: OptimizationAssistantOutputSchema,
  },
  async (input) => {
    // Step 1: Identify the document's domain using another AI flow.
    const { domain } = await identifyDocumentDomain({ documentText: input.documentText });

    // Step 2: Use the identified domain to process the assignment.
    // The processDocuments service contains the core logic for assigning to a lawyer.
    const { results } = await processDocuments([{ id: 1, domain }]);

    if (results.length === 0) {
      throw new Error(`Could not assign document. No lawyer found for the identified domain: ${domain}`);
    }
    
    // Step 3: Return the successful assignment.
    return {
        assignment: results[0],
    };
  }
);
