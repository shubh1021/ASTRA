
'use server';

/**
 * @fileOverview A flow for performing deep searches on the web for legal queries.
 *
 * - deepSearch - A function that takes a query, searches the web, and returns related legal clauses.
 * - DeepSearchInput - The input type for the deepSearch function.
 * - DeepSearchOutput - The return type for the deepSearch function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
const DeepSearchInputSchema = z.object({
  query: z.string().describe('The legal query or topic to search for clauses about.'),
  documentDataUri: z.string().optional().describe(
    "An optional document or image file for context, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type DeepSearchInput = z.infer<typeof DeepSearchInputSchema>;

// Output Schema
const RelatedClauseSchema = z.object({
    clauseText: z.string().describe("The exact text of the related legal clause found online."),
    sourceTitle: z.string().describe("The title of the source website or document."),
    sourceUrl: z.string().describe("The URL where the clause was found."),
    relevance: z.string().describe("A brief explanation of how this clause relates to the user's query or document context.")
});

const DeepSearchOutputSchema = z.object({
  relatedClauses: z.array(RelatedClauseSchema).describe("A list of relevant legal clauses discovered from the web search.")
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

  // Refine the query for better accuracy
  const refinedQuery = `${query} legal clause`;

  const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(refinedQuery)}`, {
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
    name: "deepSearchClauseAnalysisPrompt",
    input: { schema: z.object({ query: z.string(), documentContext: z.string().optional(), searchResults: z.string() }) },
    output: { schema: DeepSearchOutputSchema },
    prompt: `You are a highly efficient legal research AI. Your task is to analyze the provided web search results and extract relevant legal clauses based on the user's query.

    User's Query: "{{query}}"
    
    {{#if documentContext}}
    The user has also provided the following document for additional context. Use it to inform the relevance of the clauses you find.
    Context: {{media url=documentContext}}
    {{/if}}

    Analyze the search results below. For each relevant result, you must:
    1. Extract the specific legal clause text.
    2. Identify the source title and URL.
    3. Provide a brief explanation of its relevance to the user's query.
    
    Return a list of these clauses. Focus on accuracy and relevance. Do not summarize; extract the clauses directly.

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

    // Use top 5 results for speed and relevance
    const relevantResults = searchData.slice(0, 5) || [];

    if (relevantResults.length === 0) {
        return {
            relatedClauses: []
        };
    }
    
    const { output } = await analysisPrompt({
        query: input.query,
        documentContext: input.documentDataUri,
        searchResults: JSON.stringify(relevantResults, null, 2),
    });

    if (!output) {
      return {
        relatedClauses: []
      };
    }
    
    // Ensure we return valid sources even if the model hallucinates
    const validClauses = (output.relatedClauses || []).filter((c: any) => c.sourceUrl && c.clauseText);

    return {
        relatedClauses: validClauses
    };
  }
);
