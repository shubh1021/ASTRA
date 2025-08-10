
import { config } from 'dotenv';
config();

import '@/ai/flows/redact-sensitive-data.ts';
import '@/ai/flows/summarize-document.ts';
import '@/ai/flows/analyze-legal-clauses.ts';
import '@/ai/flows/deep-search.ts';
import '@/ai/flows/legal-chatbot.ts';
import '@/ai/flows/identify-document-domain.ts';
