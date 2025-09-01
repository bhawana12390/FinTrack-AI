'use server';

/**
 * @fileOverview An AI agent that provides personalized financial tips based on transaction history.
 *
 * - getFinancialTips - A function that generates financial tips based on user transaction history.
 */

import {ai} from '@/ai/genkit';
import {
  FinancialTipsInputSchema,
  FinancialTipsOutputSchema,
  type FinancialTipsInput,
  type FinancialTipsOutput,
} from '@/lib/types';

export async function getFinancialTips(input: FinancialTipsInput): Promise<FinancialTipsOutput> {
  return financialTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'financialTipsPrompt',
  input: {schema: FinancialTipsInputSchema},
  output: {schema: FinancialTipsOutputSchema},
  prompt: `You are a personal financial advisor. Analyze the following transaction history and provide personalized financial tips to the user.

Transaction History:
{{{transactionHistory}}}

Tips:`, // Ensure the prompt ends with "Tips:" so the LLM lists the tips.
});

const financialTipsFlow = ai.defineFlow(
  {
    name: 'financialTipsFlow',
    inputSchema: FinancialTipsInputSchema,
    outputSchema: FinancialTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
