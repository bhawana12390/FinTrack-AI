'use server';

/**
 * @fileOverview An AI flow to forecast spending against a budget based on transaction history.
 * - forecastSpending - Analyzes spending habits and predicts end-of-month total.
 */

import { ai } from '@/ai/genkit';
import {
  ForecastSpendingInputSchema,
  ForecastSpendingOutputSchema,
  type ForecastSpendingInput,
  type ForecastSpendingOutput,
} from '@/lib/types';
import { z } from 'zod';

const prompt = ai.definePrompt({
  name: 'forecastSpendingPrompt',
  input: { schema: z.object({ 
    transactions: z.string(), 
    budgetAmount: z.number(),
    category: z.string(),
    daysInMonth: z.number(),
    dayOfMonth: z.number(),
   }) },
  output: { schema: ForecastSpendingOutputSchema },
  prompt: `You are a financial analyst. Based on the spending pattern for the category "{{category}}" so far this month, forecast the total spending for the entire month.

Current day of the month: {{dayOfMonth}}
Total days in the month: {{daysInMonth}}
Budgeted amount for {{category}}: {{budgetAmount}}
Transaction history for {{category}} this month:
{{{transactions}}}

Based on the transactions, calculate the projected total spending for the full month.
Then, calculate the difference between the projected spending and the budget.
Finally, provide a short, one-sentence insight based on the forecast. If they are projected to be under budget, be encouraging. If they are projected to be over budget, be cautionary but not alarming.

Return the result in JSON format.`,
});

const forecastSpendingFlow = ai.defineFlow(
  {
    name: 'forecastSpendingFlow',
    inputSchema: ForecastSpendingInputSchema,
    outputSchema: ForecastSpendingOutputSchema,
  },
  async (input) => {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const transactionsForMonth = JSON.parse(input.transactions).filter((t: any) => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === month && tDate.getFullYear() === year;
    });

    const { output } = await prompt({
        transactions: JSON.stringify(transactionsForMonth),
        budgetAmount: input.budgetAmount,
        category: input.category,
        dayOfMonth,
        daysInMonth,
    });
    return output!;
  }
);

export async function forecastSpending(input: ForecastSpendingInput): Promise<ForecastSpendingOutput> {
  return forecastSpendingFlow(input);
}
