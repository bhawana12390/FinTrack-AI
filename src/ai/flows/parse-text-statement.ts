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
// import type { PDFData } from 'pdf-parse';

const prompt = ai.definePrompt({
  name: 'parseTextStatementPrompt',
  input: { schema: z.object({ csvContent: z.string() }) },
  output: { schema: ParseStatementOutputSchema },
  prompt: `You are an expert at parsing financial statements CSV data. Your task is to analyze the provided CSV content, which has been extracted from a statement, identify the transactions, and categorize them.

The available categories are: ${categories.join(', ')}.

The CSV has the following columns: Date, Amount, Category, Title, Note, Account

Instructions:
- Parse each row as a transaction
- Convert the date from DD-MM-YYYY HH:MM format to YYYY-MM-DD format
- Use the Amount field directly as-is (it's already a positive number)
- Map the Category field to one of the available categories, or determine the best category from the Title/Note if Category is empty
- Use the Title field as the description
- Determine if the transaction is "income" (positive amount) or "expense" (negative amount)
- Skip the header row
- Return a list of all transactions in the specified JSON format

Here is the CSV content:
{{{csvContent}}}

`,
});

const parseTextStatementFlow = ai.defineFlow(
  {
    name: 'parseTextStatementFlow',
    inputSchema: ParseTextStatementInputSchema,
    outputSchema: ParseStatementOutputSchema,
  },
  async (input) => {
    try {
      if (!input.pdfDataUri) {
        throw new Error('No PDF data URI provided');
      }

      const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${pythonBackendUrl}/process-statement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdf_data: input.pdfDataUri }),
      });

      if (!response.ok) {
        throw new Error(`Failed to process statement: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.csv_content) {
        throw new Error('No CSV content returned from backend');
      } 

      const { output } = await prompt({ csvContent: result.csv_content });
      return output!;
    } catch (error) {
      console.error('Error in parseTextStatementFlow:', error);
      return { transactions: [] };
    }
  }
);

export async function parseTextStatement(input: ParseTextStatementInput): Promise<ParseStatementOutput> {
  return parseTextStatementFlow(input);
}
