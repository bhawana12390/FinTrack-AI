'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Loader2 } from 'lucide-react';
import type { ParsedTransaction } from '@/lib/types';
import { StatementReview } from './statement-review';

// This is a new interface to match the CSV structure from your backend
interface CsvTransaction {
    Date: string;
    Amount: string;
    Category: string;
    Title: string;
    Note: string;
    Account: string;
}

const parseCsvContent = (csvContent: string): ParsedTransaction[] => {
    if (!csvContent) return [];
    const rows = csvContent.trim().split('\n');
    const headers = rows.shift()?.split(',') || [];
    
    // Map CSV data to ParsedTransaction
    return rows.map(row => {
        const values = row.split(',');
        const csvRow = headers.reduce((obj, header, index) => {
            // @ts-ignore
            obj[header.trim()] = values[index];
            return obj;
        }, {} as CsvTransaction);

        const amount = parseFloat(csvRow.Amount);
        const type = amount >= 0 ? 'income' : 'expense';

        return {
            date: new Date(csvRow.Date.split(' ')[0].split('-').reverse().join('-')).toISOString(), // Convert DD-MM-YYYY to YYYY-MM-DD
            description: csvRow.Title,
            amount: Math.abs(amount), // Use absolute amount
            type: type,
            category: csvRow.Category || 'Other', // Default category if empty
        };
    });
};

interface ImportStatementDialogProps {
  addMultipleTransactions: (transactions: ParsedTransaction[]) => void;
}

export function ImportStatementDialog({ addMultipleTransactions }: ImportStatementDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
        toast({
            variant: 'destructive',
            title: 'Invalid File Type',
            description: 'Please upload a PDF file.',
        });
        setFile(null);
        event.target.value = ''; // Reset file input
    }
  };

  const handleParse = async () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please select a PDF file to import.',
      });
      return;
    }

    setIsLoading(true);
    setParsedTransactions([]);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async (e) => {
        try {
            const pdfDataUri = e.target?.result as string;
            if (!pdfDataUri) {
                throw new Error("Could not read file data.");
            }
            
            const response = await fetch('http://localhost:8000/process-statement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pdf_data: pdfDataUri }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'An unknown error occurred on the backend.' }));
                throw new Error(errorData.detail || 'Failed to process statement');
            }

            const result = await response.json();

            if (result.transaction_count === 0) {
              toast({
                  variant: 'destructive',
                  title: 'No Transactions Found',
                  description: 'The backend could not find any transactions in the statement.',
              });
            } else {
              const transactions = parseCsvContent(result.csv_content);
              setParsedTransactions(transactions);
              toast({
                  title: 'Statement Parsed',
                  description: `Found ${transactions.length} transactions. Please review and confirm.`,
              });
            }
        } catch (error: any) {
            console.error('Failed to parse statement:', error);
            toast({
                variant: 'destructive',
                title: 'Parsing Failed',
                description: error.message || 'An error occurred while communicating with the backend.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    reader.onerror = (error) => {
        console.error('File reading error:', error);
        toast({
            variant: 'destructive',
            title: 'File Read Error',
            description: 'Could not read the selected file.',
        });
        setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    addMultipleTransactions(parsedTransactions);
    toast({
      title: 'Success!',
      description: `${parsedTransactions.length} transactions have been added to your history.`,
    });
    resetState();
    setOpen(false);
  };
  
  const resetState = () => {
      setFile(null);
      setParsedTransactions([]);
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetState();
    }
    setOpen(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UploadCloud className="mr-2 h-4 w-4" />
          Import Statement
        </Button>
      </DialogTrigger>
      <DialogContent className={parsedTransactions.length > 0 ? "max-w-4xl" : "sm:max-w-md"}>
        <DialogHeader>
          <DialogTitle>Import Transaction Statement</DialogTitle>
          <DialogDescription>
            {parsedTransactions.length === 0 
                ? "Upload a PDF statement from your bank to automatically import transactions."
                : "Review the parsed transactions before adding them to your history."
            }
          </DialogDescription>
        </DialogHeader>
        
        {parsedTransactions.length === 0 ? (
          <div className="space-y-4 py-4">
            <Input type="file" accept=".pdf" onChange={handleFileChange} />
            <Button onClick={handleParse} disabled={isLoading || !file} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Parsing...
                </>
              ) : (
                'Parse Statement'
              )}
            </Button>
          </div>
        ) : (
          <StatementReview 
            transactions={parsedTransactions}
            onConfirm={handleConfirm}
            onCancel={resetState}
          />
        )}

      </DialogContent>
    </Dialog>
  );
}
