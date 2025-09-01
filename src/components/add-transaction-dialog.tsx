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
import { TransactionForm } from './transaction-form';
import type { Transaction } from '@/lib/types';
import { PlusCircle } from 'lucide-react';

interface AddTransactionDialogProps {
  addTransaction: (transaction: Omit<Transaction, 'id' | 'currency'>) => void;
}

export function AddTransactionDialog({ addTransaction }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = (values: Omit<Transaction, 'id' | 'date' | 'currency'> & { date: Date }) => {
    addTransaction({ ...values, date: values.date.toISOString() });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Log a new income or expense to your account.
          </DialogDescription>
        </DialogHeader>
        <TransactionForm onSubmit={handleSubmit} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
