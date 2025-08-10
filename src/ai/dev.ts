import { config } from 'dotenv';
config();

import '@/ai/flows/redact-sensitive-data.ts';
import '@/ai/flows/summarize-document.ts';
import '@/ai/flows/analyze-legal-clauses.ts';