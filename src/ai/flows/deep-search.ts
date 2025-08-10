
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
  documentDataUri: z.string().optional().describe(
    "An optional document or image file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
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

// Internal function to perform the web search with Brave
async function performWebSearch(query: string): Promise<any> {
  const braveApiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!braveApiKey) {
    throw new Error('BRAVE_SEARCH_API_KEY is not set in environment variables.');
  }

  const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`, {
    headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': braveApiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Brave Search API request failed with status ${response.status}`);
  }

  const data = await response.json();
  return (data.web?.results || []).map((item: any) => ({
      title: item.title,
      url: item.url,
      snippet: item.description,
  }));
}

const analysisPrompt = ai.definePrompt({
    name: "deepSearchAnalysisPrompt",
    input: { schema: z.object({ query: z.string(), documentContext: z.string().optional(), searchResults: z.string() }) },
    output: { schema: DeepSearchOutputSchema },
    prompt: `You are a legal research assistant. Analyze the following search results for the query: "{{query}}".
    
    {{#if documentContext}}
    The user has provided the following document for additional context:
    {{media url=documentContext}}
    {{/if}}

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

    const relevantResults = searchData.slice(0, 10) || [];

    if (relevantResults.length === 0) {
        return {
            summary: "No relevant search results found.",
            keyPoints: [],
            sources: []
        };
    }
    
    const { output } = await analysisPrompt({
        query: input.query,
        documentContext: input.documentDataUri,
        searchResults: JSON.stringify(relevantResults, null, 2),
    });

    if (!output) {
        return {
            summary: "Failed to generate an analysis from the search results.",
            keyPoints: [],
            sources: [],
        };
    }
    
    // Ensure we return valid sources even if the model hallucinates
    const validSources = (output.sources || []).filter((s: any) => s.url).slice(0, 5);

    return {
        summary: output.summary || "No summary generated.",
        keyPoints: output.keyPoints || [],
        sources: validSources
    };
  }
);
