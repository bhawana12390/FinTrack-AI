'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './use-auth';
import type { Transaction, ParsedTransaction } from '@/lib/types';

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'users', user.uid, 'transactions'),
        orderBy('date', 'desc')
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const transactionsData: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          transactionsData.push({
            id: doc.id,
            ...data,
            date: (data.date as Timestamp).toDate().toISOString(),
          } as Transaction);
        });
        setTransactions(transactionsData);
        setIsLoaded(true);
      }, (error) => {
        console.error('Failed to fetch transactions:', error);
        setIsLoaded(true);
      });
      return () => unsubscribe();
    } else {
      // Not logged in, clear transactions and set loaded
      setTransactions([]);
      setIsLoaded(true);
    }
  }, [user]);

  const addTransaction = useCallback(
    async (newTransaction: Omit<Transaction, 'id' | 'currency'>) => {
      if (!user) return;
      try {
        const docData = {
          ...newTransaction,
          date: Timestamp.fromDate(new Date(newTransaction.date)),
          currency: 'INR',
        };
        await addDoc(collection(db, 'users', user.uid, 'transactions'), docData);
      } catch (error) {
        console.error('Error adding transaction: ', error);
      }
    },
    [user]
  );
  
  const addMultipleTransactions = useCallback(async (newTransactions: ParsedTransaction[]) => {
    if (!user) return;
    const batch = writeBatch(db);
    newTransactions.forEach(t => {
      const newDocRef = doc(collection(db, 'users', user.uid, 'transactions'));
      batch.set(newDocRef, {
        ...t,
        date: Timestamp.fromDate(new Date(t.date)),
        currency: 'INR',
      });
    });
    await batch.commit();
  }, [user]);

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!user) return;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
      } catch (error) {
        console.error('Error deleting transaction: ', error);
      }
    },
    [user]
  );

  const deleteAllTransactions = useCallback(async () => {
    if (!user) return;
    try {
      const transactionsCollectionRef = collection(db, 'users', user.uid, 'transactions');
      const querySnapshot = await getDocs(transactionsCollectionRef);
      
      if (querySnapshot.empty) {
        return;
      }
      
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    } catch (error) {
      console.error('Error deleting all transactions: ', error);
      // Optionally, show a toast to the user about the failure
    }
  }, [user]);

  return {
    transactions,
    addTransaction,
    deleteTransaction,
    isLoaded,
    addMultipleTransactions,
    deleteAllTransactions,
  };
}
