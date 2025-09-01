'use server';

/**
 * @fileOverview An AI flow to parse and categorize transactions from raw text.
 * - parseTextStatement - Parses text and returns structured transaction data.
 */

import { ai } from '@/ai/genkit';
import {
  ParseTextStatementInputSchema,
  ParseStatementOutputSchema,
  type ParseTextStatementInput,
  type ParseStatementOutput,
  categories,
} from '@/lib/types';
import { z } from 'zod';
import type { PDFData } from 'pdf-parse';

const prompt = ai.definePrompt({
  name: 'parseTextStatementPrompt',
  input: { schema: z.object({ textContent: z.string() }) },
  output: { schema: ParseStatementOutputSchema },
  prompt: `You are an expert at parsing financial statements. Your task is to analyze the provided text content, which has been extracted from a statement, identify the transactions, and categorize them.

The available categories are: ${categories.join(', ')}.

- The text is unstructured. You must find the transaction data within it.
- Analyze the description of each transaction to determine the most appropriate category.
- Determine if the transaction is an "income" or an "expense".
- Convert the date to a standard YYYY-MM-DD format.
- Extract the transaction amount.
- Return a list of all transactions in the specified JSON format. Ignore any non-transactional text.

Here is the statement's text content:
{{{textContent}}}
`,
});

const parseTextStatementFlow = ai.defineFlow(
  {
    name: 'parseTextStatementFlow',
    inputSchema: ParseTextStatementInputSchema,
    outputSchema: ParseStatementOutputSchema,
  },
  async (input) => {
    let textContent = input.textContent;
    if (input.pdfDataUri) {
      const pdf = (await import('pdf-parse')).default;
      const base64Data = input.pdfDataUri.split(',')[1];
      const pdfBuffer = Buffer.from(base64Data, 'base64');
      const data: PDFData = await pdf(pdfBuffer);
      textContent = data.text;
    }
    
    if (!textContent) {
      return { transactions: [] };
    }

    const { output } = await prompt({ textContent });
    return output!;
  }
);

export async function parseTextStatement(input: ParseTextStatementInput): Promise<ParseStatementOutput> {
  return parseTextStatementFlow(input);
}
