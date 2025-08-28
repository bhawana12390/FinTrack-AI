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
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Loader2 } from 'lucide-react';
import { parseTextStatement } from '@/ai/flows/parse-text-statement';
import type { ParsedTransaction } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

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
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleImport = async () => {
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
            
            const response = await parseTextStatement({ pdfDataUri });
            if (response.transactions.length === 0) {
              toast({
                  variant: 'destructive',
                  title: 'No Transactions Found',
                  description: 'The AI could not find any transactions in the statement. Please ensure it is a valid transaction statement.',
              });
            } else {
              setParsedTransactions(response.transactions);
              toast({
                  title: 'Statement Parsed',
                  description: `Found ${response.transactions.length} transactions. Please review and confirm.`,
              });
            }
        } catch (error) {
            console.error('Failed to parse statement:', error);
            toast({
                variant: 'destructive',
                title: 'Parsing Failed',
                description: 'The AI could not parse the statement. Please check the file format or try again.',
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
            description: 'Could not read the selected file. Please ensure it is a valid PDF.',
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
    setFile(null);
    setParsedTransactions([]);
    setOpen(false);
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset state when closing
      setFile(null);
      setParsedTransactions([]);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Transaction Statement</DialogTitle>
          <DialogDescription>
            Upload a PDF statement from your bank to automatically import transactions.
          </DialogDescription>
        </DialogHeader>
        
        {parsedTransactions.length === 0 ? (
          <div className="space-y-4 py-4">
            <Input type="file" accept=".pdf" onChange={handleFileChange} />
            <Button onClick={handleImport} disabled={isLoading || !file} className="w-full">
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
          <div className='space-y-4'>
            <Alert>
                <AlertTitle>Review Transactions</AlertTitle>
                <AlertDescription>
                    Found {parsedTransactions.length} transactions. Review them below and click confirm to add them.
                </AlertDescription>
            </Alert>
            {/* We can add a review table here in the next step */}
            <DialogFooter>
                <Button variant="ghost" onClick={() => setParsedTransactions([])}>Back</Button>
                <Button onClick={handleConfirm}>Confirm and Add</Button>
            </DialogFooter>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
