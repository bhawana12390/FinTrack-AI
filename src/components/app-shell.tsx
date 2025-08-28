'use client';

import { useTransactions } from '@/hooks/use-transactions';
import { AddTransactionDialog } from './add-transaction-dialog';
import { VoiceInputDialog } from './voice-input-dialog';
import { ImportStatementDialog } from './import-statement-dialog';
import { Dashboard } from './dashboard';
import { FinancialTips } from './financial-tips';
import { TransactionList } from './transaction-list';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Wallet } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { useMemo } from 'react';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
};

export default function AppShell() {
  const { transactions, addTransaction, deleteTransaction, isLoaded, addMultipleTransactions } = useTransactions();
  
  const handleAddTransaction = (data: Omit<Transaction, 'id' | 'date' | 'currency'> & { date: Date | string }) => {
    const date = typeof data.date === 'string' ? data.date : data.date.toISOString();
    addTransaction({
      ...data,
      date,
    });
  };

  const totalIncome = useMemo(() => transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0), [transactions]);

  const totalExpense = useMemo(() => transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0), [transactions]);

  const balance = totalIncome - totalExpense;

  if (!isLoaded) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <header className="flex justify-between items-center">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-24" />
        </header>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
           <Skeleton className="h-32" />
           <Skeleton className="h-32" />
           <Skeleton className="h-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-5">
          <div className="md:col-span-3 space-y-6">
            <Skeleton className="h-96" />
          </div>
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="flex-1 space-y-6 p-4 md:p-8">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline text-primary">
              FinTrack AI
            </h1>
            <p className="text-muted-foreground">
              Your intelligent financial companion.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AddTransactionDialog addTransaction={handleAddTransaction} />
            <VoiceInputDialog addTransaction={handleAddTransaction} />
            <ImportStatementDialog addMultipleTransactions={addMultipleTransactions} />
          </div>
        </header>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <span className="text-green-500">
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 flex items-center">
                {formatCurrency(totalIncome)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
               <span className="text-red-500">
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 flex items-center">
                 {formatCurrency(totalExpense)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                 {formatCurrency(balance)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
                <TransactionList transactions={transactions} deleteTransaction={deleteTransaction} />
            </div>
            <div className="lg:col-span-2 space-y-6">
                 <Dashboard transactions={transactions} />
                 <FinancialTips transactions={transactions} />
            </div>
        </div>

      </main>
    </div>
  );
}
