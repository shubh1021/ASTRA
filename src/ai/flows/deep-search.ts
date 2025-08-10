
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
import Groq from 'groq-sdk';

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

    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
    });

    const documentContext = input.documentDataUri 
        ? `The user has provided the following document for additional context: ${input.documentDataUri.startsWith('data:image') ? 'An image is attached.' : 'A text document is attached.'}\n\n`
        : '';

    const prompt = `You are a legal research assistant. Analyze the following search results for the query: "${input.query}".
    
    ${documentContext}
    Provide a concise summary, a list of key points, and the top 5 most relevant source URLs.
    
    Search Results:
    ${JSON.stringify(relevantResults, null, 2)}

    Return your response as a JSON object with the following structure:
    {
        "summary": "Your concise summary here.",
        "keyPoints": ["Key point 1", "Key point 2"],
        "sources": [
            {"title": "Source 1 Title", "url": "https://example.com/source1"},
            {"title": "Source 2 Title", "url": "https://example.com/source2"}
        ]
    }
    `;
    
    const messages: any = [{ role: 'user', content: prompt }];
    if (input.documentDataUri) {
        messages[0].content = [
            { type: "text", text: prompt },
        ];
    }


    const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama3-8b-8192', // Or another suitable model
        response_format: { type: "json_object" },
    });
    
    const output = JSON.parse(chatCompletion.choices[0].message.content || '{}');
    
    // Ensure we return valid sources even if the model hallucinates
    const validSources = (output.sources || []).filter((s: any) => s.url).slice(0, 5);

    return {
        summary: output.summary || "No summary generated.",
        keyPoints: output.keyPoints || [],
        sources: validSources
    };
  }
);
