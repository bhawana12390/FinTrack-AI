'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/voice-command-transcription.ts';
import '@/ai/flows/financial-tips.ts';
import '@/ai/flows/generate-pdf.ts';
import '@/ai/flows/parse-text-statement.ts';
