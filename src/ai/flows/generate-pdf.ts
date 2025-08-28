'use server';

/**
 * @fileOverview A flow for generating a PDF of transactions using jsPDF.
 * - generatePdf - A function that creates a PDF from a list of transactions.
 */
import { ai } from '@/ai/genkit';
import { GeneratePdfInputSchema, GeneratePdfOutputSchema, type GeneratePdfInput, type GeneratePdfOutput } from '@/lib/types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import type { Transaction } from '@/lib/types';


async function createPdf(transactions: Transaction[]): Promise<string> {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Transaction History', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    const tableData = transactions.map(t => [
        format(new Date(t.date), 'dd MMM yyyy'),
        t.description,
        t.category,
        t.type,
        t.amount.toFixed(2),
    ]);

    autoTable(doc, {
        head: [['Date', 'Description', 'Category', 'Type', 'Amount (INR)']],
        body: tableData,
        startY: 30,
        headStyles: { fillColor: [41, 128, 185] },
    });

    const pdfOutput = doc.output('datauristring');
    return pdfOutput;
}

const generatePdfFlow = ai.defineFlow(
    {
      name: 'generatePdfFlow',
      inputSchema: GeneratePdfInputSchema,
      outputSchema: GeneratePdfOutputSchema,
    },
    async (input) => {
      const transactions = JSON.parse(input.transactions) as Transaction[];
      const pdfDataUri = await createPdf(transactions);
      return {
        pdfDataUri,
      };
    }
);

export async function generatePdf(input: GeneratePdfInput): Promise<GeneratePdfOutput> {
    return generatePdfFlow(input);
}
