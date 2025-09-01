'use client';

import { useMemo, useState } from 'react';
import type { Budget, Transaction, ForecastSpendingOutput, Category } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Trash2, BrainCircuit, Loader2, AlertCircle } from 'lucide-react';
import { categoryIcons } from './icons';
import { cn } from '@/lib/utils';
import { forecastSpending } from '@/ai/flows/forecast-spending';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface BudgetListProps {
  budgets: Budget[];
  transactions: Transaction[];
  deleteBudget: (id: string) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

interface BudgetItemProps {
  budget: Budget;
  spent: number;
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

function BudgetItem({ budget, spent, transactions, onDelete }: BudgetItemProps) {
  const [forecast, setForecast] = useState<ForecastSpendingOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const progress = Math.min((spent / budget.amount) * 100, 100);
  const Icon = categoryIcons[budget.category] || categoryIcons.Other;
  const remaining = budget.amount - spent;

  const handleGetForecast = async () => {
    setIsLoading(true);
    setForecast(null);
    try {
        const relevantTransactions = transactions.filter(t => t.category === budget.category && t.type === 'expense');
        const result = await forecastSpending({
            category: budget.category,
            budgetAmount: budget.amount,
            transactions: JSON.stringify(relevantTransactions)
        });
        setForecast(result);
    } catch (e) {
        console.error('Failed to get forecast:', e);
        toast({
            variant: 'destructive',
            title: 'Forecast Failed',
            description: 'Could not generate spending forecast. Please try again.',
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Icon className="h-6 w-6 text-muted-foreground" />
                <div className="flex flex-col">
                    <span className="font-semibold">{budget.category}</span>
                    <span className="text-sm text-muted-foreground">
                        {formatCurrency(spent)} spent of {formatCurrency(budget.amount)}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleGetForecast} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete your budget for {budget.category}. This action cannot be undone.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(budget.id)} className="bg-destructive hover:bg-destructive/90">
                            Delete Budget
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
        <div>
            <Progress value={progress} />
            <div className="flex justify-between text-sm mt-1">
                <span className={cn("font-medium", remaining < 0 ? 'text-red-500' : 'text-green-600')}>
                    {remaining >= 0 ? `${formatCurrency(remaining)} left` : `${formatCurrency(Math.abs(remaining))} over`}
                </span>
                 <span>{progress.toFixed(0)}%</span>
            </div>
        </div>
        {forecast && (
            <div className={cn(
                "mt-2 text-sm rounded-md p-2 flex items-center gap-2",
                forecast.overUnderAmount > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
            )}>
                <AlertCircle className="h-4 w-4" />
                <p><span className="font-semibold">Forecast:</span> {forecast.insight}</p>
            </div>
        )}
    </div>
  )
}

export function BudgetList({ budgets, transactions, deleteBudget }: BudgetListProps) {
  const expensesThisMonth = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      return (
        t.type === 'expense' &&
        tDate.getMonth() === now.getMonth() &&
        tDate.getFullYear() === now.getFullYear()
      );
    });
  }, [transactions]);

  const spendingByCategory = useMemo(() => {
    return expensesThisMonth.reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = 0;
      }
      acc[t.category] += t.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [expensesThisMonth]);

  if (budgets.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Monthly Budgets</CardTitle>
                <CardDescription>You haven't set any budgets yet. Add one to start tracking!</CardDescription>
            </CardHeader>
        </Card>
    )
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Monthly Budgets</CardTitle>
            <CardDescription>Track your spending against your monthly limits.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgets.map(budget => (
                    <BudgetItem 
                        key={budget.id}
                        budget={budget}
                        spent={spendingByCategory[budget.category] || 0}
                        transactions={transactions}
                        onDelete={deleteBudget}
                    />
                ))}
            </div>
        </CardContent>
    </Card>
  );
}
