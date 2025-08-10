
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
import { processDocuments, Document, AssignmentResult } from '@/services/optimization';


const OptimizationAssistantInputSchema = z.object({
    documents: z.array(z.object({
        id: z.union([z.string(), z.number()]),
        text: z.string().describe('The text content of the legal document to analyze.'),
    })).describe('A list of documents to analyze and assign.'),
});
export type OptimizationAssistantInput = z.infer<typeof OptimizationAssistantInputSchema>;


const OptimizationAssistantOutputSchema = z.object({
    assignments: z.array(z.object({
        fileName: z.string().describe("The name of the original file."),
        docDomain: z.string().describe('The identified legal domain of the document.'),
        lawyerName: z.string().describe('The name of the lawyer the document was assigned to.'),
        newLoad: z.number().describe("The assigned lawyer's new total number of documents."),
    })),
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
    // Step 1: Identify the domain for all documents in the batch.
    const domainResults = await identifyDocumentDomain({ documents: input.documents.map(d => ({id: d.id, text: d.text})) });

    const documentsToProcess: Document[] = domainResults.results.map(result => ({
        id: result.documentId as number, // Assuming numeric IDs from the front-end
        domain: result.domain,
    }));

    // Step 2: Use the identified domains to process the assignments.
    const { results } = await processDocuments(documentsToProcess);

    if (results.length === 0) {
      throw new Error(`Could not assign documents. No lawyers found for the identified domains.`);
    }
    
    // Step 3: Map results back to original file names and return.
    const finalAssignments = results.map(res => {
        const originalDoc = input.documents.find(d => d.id.toString() === res.docId.toString());
        return {
            ...res,
            fileName: originalDoc?.id.toString() || 'Unknown File' // Use file name as ID from client
        }
    });

    return {
        assignments: finalAssignments,
    };
  }
);
