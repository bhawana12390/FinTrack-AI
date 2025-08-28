'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Transaction } from '@/lib/types';
import type { ParsedTransaction } from '@/lib/types';

const STORAGE_KEY = 'fintrack-ai-transactions';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedItems = localStorage.getItem(STORAGE_KEY);
      if (storedItems) {
        setTransactions(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error('Failed to load transactions from local storage', error);
      setTransactions([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
      } catch (error) {
        console.error('Failed to save transactions to local storage', error);
      }
    }
  }, [transactions, isLoaded]);

  const addTransaction = useCallback((newTransaction: Omit<Transaction, 'id' | 'currency'>) => {
    setTransactions((prev) => [
      { ...newTransaction, id: crypto.randomUUID(), currency: 'INR' },
      ...prev,
    ]);
  }, []);

  const addMultipleTransactions = useCallback((newTransactions: ParsedTransaction[]) => {
    const transactionsToAdd: Transaction[] = newTransactions.map(t => ({
      ...t,
      id: crypto.randomUUID(),
      currency: 'INR',
    }));
    setTransactions(prev => [...transactionsToAdd, ...prev]);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateTransaction = useCallback((updatedTransaction: Transaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t))
    );
  }, []);

  return { transactions, addTransaction, deleteTransaction, updateTransaction, isLoaded, addMultipleTransactions };
}
