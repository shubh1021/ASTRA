
'use server';

/**
 * @fileOverview A flow for performing deep searches on the web for legal queries.
 *
 * - deepSearch - A function that takes a query, searches the web, and returns a summarized analysis.
 * - DeepSearchInput - The input type for the deepSearch function.
 * - DeepSearchOutput - The return type for the deepSearch function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
const DeepSearchInputSchema = z.object({
  query: z.string().describe('The legal query to search for.'),
});
export type DeepSearchInput = z.infer<typeof DeepSearchInputSchema>;

// Output Schema
const DeepSearchOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the findings.'),
  keyPoints: z.array(z.string()).describe('A list of key points from the search results.'),
  sources: z.array(
    z.object({
      title: z.string().describe('The title of the search result.'),
      url: z.string().url().describe('The URL of the search result.'),
    })
  ).describe('A list of relevant source URLs.'),
});
export type DeepSearchOutput = z.infer<typeof DeepSearchOutputSchema>;

// The exported function that will be called from the UI
export async function deepSearch(input: DeepSearchInput): Promise<DeepSearchOutput> {
  return deepSearchFlow(input);
}

// Internal function to perform the web search
async function performWebSearch(query: string): Promise<any> {
  const serperApiKey = process.env.NEXT_PUBLIC_SERPER_API_KEY;
  if (!serperApiKey) {
    throw new Error('SERPER_API_KEY is not set in environment variables.');
  }

  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': serperApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query }),
  });

  if (!response.ok) {
    throw new Error(`Serper API request failed with status ${response.status}`);
  }

  return response.json();
}

// Genkit Prompt
const searchAnalysisPrompt = ai.definePrompt({
    name: 'searchAnalysisPrompt',
    input: { schema: z.object({ query: z.string(), searchResults: z.any() }) },
    output: { schema: DeepSearchOutputSchema },
    prompt: `You are a legal research assistant. Analyze the following search results for the query: "{{query}}".
    
    Provide a concise summary, a list of key points, and the top 5 most relevant source URLs.
    
    Search Results:
    {{{searchResults}}}
    `,
});


// Genkit Flow
const deepSearchFlow = ai.defineFlow(
  {
    name: 'deepSearchFlow',
    inputSchema: DeepSearchInputSchema,
    outputSchema: DeepSearchOutputSchema,
  },
  async (input) => {
    const searchData = await performWebSearch(input.query);

    // Limit to top 10 results for analysis
    const relevantResults = searchData.organic?.slice(0, 10) || [];

    if (relevantResults.length === 0) {
        return {
            summary: "No relevant search results found.",
            keyPoints: [],
            sources: []
        };
    }

    const { output } = await searchAnalysisPrompt({
      query: input.query,
      searchResults: JSON.stringify(relevantResults, null, 2),
    });

    // Ensure we return valid sources even if the model hallucinates
    const validSources = output!.sources.filter(s => s.url).slice(0, 5);

    return {
        ...output!,
        sources: validSources
    };
  }
);
