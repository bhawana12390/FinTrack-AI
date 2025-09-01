import { z } from 'zod';

export const expenseCategories = [
  'Food',
  'Transport',
  'Shopping',
  'Housing',
  'Utilities',
  'Entertainment',
  'Health',
  'Education',
  'Other',
] as const;

export const incomeCategories = [
  'Salary',
  'Freelance',
  'Investments',
  'Gifts',
  'Other',
] as const;

export const categories = [
    'Food',
    'Transport',
    'Shopping',
    'Housing',
    'Utilities',
    'Entertainment',
    'Health',
    'Education',
    'Salary',
    'Freelance',
    'Investments',
    'Gifts',
    'Other'
] as const;


export type ExpenseCategory = (typeof expenseCategories)[number];
export type IncomeCategory = (typeof incomeCategories)[number];
export type Category = (typeof categories)[number];


export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string; // ISO string
  description: string;
  amount: number;
  type: TransactionType;
  category: Category;
  currency: 'INR';
}

export interface Budget {
    id: string;
    category: Category;
    amount: number;
}

// AI Flow Schemas and Types

// --- Financial Tips ---
export const FinancialTipsInputSchema = z.object({
  transactionHistory: z
    .string()
    .describe('The transaction history of the user in JSON format.'),
});
export type FinancialTipsInput = z.infer<typeof FinancialTipsInputSchema>;

export const FinancialTipsOutputSchema = z.object({
  tips: z.array(z.string()).describe('A list of personalized financial tips.'),
});
export type FinancialTipsOutput = z.infer<typeof FinancialTipsOutputSchema>;


// --- Voice Command Transcription ---
export const TranscribeVoiceCommandInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "An audio recording of the voice command as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type TranscribeVoiceCommandInput = z.infer<typeof TranscribeVoiceCommandInputSchema>;

export const TranscribeVoiceCommandOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text from the voice command.'),
});
export type TranscribeVoiceCommandOutput = z.infer<typeof TranscribeVoiceCommandOutputSchema>;

// --- PDF Generation ---
export const GeneratePdfInputSchema = z.object({
  transactions: z.string().describe('A JSON string of transactions to include in the PDF.'),
});
export type GeneratePdfInput = z.infer<typeof GeneratePdfInputSchema>;

export const GeneratePdfOutputSchema = z.object({
  pdfDataUri: z.string().describe('The generated PDF as a base64 encoded data URI.'),
});
export type GeneratePdfOutput = z.infer<typeof GeneratePdfOutputSchema>;

// --- Statement Parsing ---
export const ParsedTransactionSchema = z.object({
  date: z.string().describe('The date of the transaction in ISO format (YYYY-MM-DD).'),
  description: z.string().optional().describe('A brief description of the transaction.'),
  amount: z.number().describe('The amount of the transaction.'),
  type: z.enum(['income', 'expense']).describe('The type of transaction.'),
  category: z.enum(categories).describe('The category of the transaction.'),
});
export type ParsedTransaction = z.infer<typeof ParsedTransactionSchema>;


export const ParseTextStatementInputSchema = z.object({
  textContent: z.string().optional().describe("The text content extracted from a financial statement."),
  pdfDataUri: z.string().optional().describe("The PDF file content as a data URI."),
});
export type ParseTextStatementInput = z.infer<typeof ParseTextStatementInputSchema>;

export const ParseStatementOutputSchema = z.object({
  transactions: z.array(ParsedTransactionSchema).describe('A list of parsed transactions from the statement.'),
});
export type ParseStatementOutput = z.infer<typeof ParseStatementOutputSchema>;


// --- Budget Forecasting ---
export const ForecastSpendingInputSchema = z.object({
    transactions: z.string().describe("A JSON string of the user's transactions for the current month in a specific category."),
    budgetAmount: z.number().describe('The budget amount for the category.'),
    category: z.string().describe('The category to forecast.'),
});
export type ForecastSpendingInput = z.infer<typeof ForecastSpendingInputSchema>;

export const ForecastSpendingOutputSchema = z.object({
    projectedSpending: z.number().describe('The forecasted total spending for the month.'),
    overUnderAmount: z.number().describe('The difference between projected spending and budget. Positive if over budget, negative if under.'),
    insight: z.string().describe('A short, actionable insight for the user.'),
});
export type ForecastSpendingOutput = z.infer<typeof ForecastSpendingOutputSchema>;
