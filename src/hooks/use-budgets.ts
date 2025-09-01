'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './use-auth';
import type { Budget } from '@/lib/types';
import { useToast } from './use-toast';

export function useBudgets() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'users', user.uid, 'budgets'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const budgetsData: Budget[] = [];
        let uniqueCategories = new Set<string>();
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Ensure no duplicate budget categories are added client-side
          if (!uniqueCategories.has(data.category)) {
            budgetsData.push({
                id: doc.id,
                ...data,
            } as Budget);
            uniqueCategories.add(data.category);
          }
        });
        setBudgets(budgetsData);
        setIsLoaded(true);
      }, (error) => {
        console.error('Failed to fetch budgets:', error);
        setIsLoaded(true);
      });
      return () => unsubscribe();
    } else {
      setBudgets([]);
      setIsLoaded(true);
    }
  }, [user]);

  const addBudget = useCallback(
    async (newBudget: Omit<Budget, 'id'>) => {
      if (!user) return;
      
      // Prevent adding a budget for a category that already has one
      if (budgets.some(b => b.category === newBudget.category)) {
          toast({
              variant: 'destructive',
              title: 'Budget Exists',
              description: `You already have a budget for the ${newBudget.category} category.`,
          });
          return;
      }

      try {
        await addDoc(collection(db, 'users', user.uid, 'budgets'), newBudget);
        toast({
            title: 'Budget Created!',
            description: `Your new budget for ${newBudget.category} has been set.`,
        });
      } catch (error) {
        console.error('Error adding budget: ', error);
      }
    },
    [user, budgets, toast]
  );

  const deleteBudget = useCallback(
    async (id: string) => {
      if (!user) return;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'budgets', id));
        toast({
            title: 'Budget Deleted',
            description: 'The budget has been removed.',
        });
      } catch (error) {
        console.error('Error deleting budget: ', error);
      }
    },
    [user, toast]
  );

  return {
    budgets,
    addBudget,
    deleteBudget,
    isLoaded,
  };
}
