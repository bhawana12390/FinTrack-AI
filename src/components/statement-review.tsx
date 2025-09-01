'use client';

import type { ParsedTransaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { format } from 'date-fns';
import { Badge } from './ui/badge';
import { categoryIcons } from './icons';
import { cn } from '@/lib/utils';

interface StatementReviewProps {
  transactions: ParsedTransaction[];
  onConfirm: () => void;
  onCancel: () => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
};

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
];

export function StatementReview({ transactions, onConfirm, onCancel }: StatementReviewProps) {
  const { totalIncome, totalExpense, balance, expenseByCategory } = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    const expenseByCategory = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        if (!acc[t.category]) {
          acc[t.category] = 0;
        }
        acc[t.category] += t.amount;
        return acc;
      }, {} as Record<string, number>);

    transactions.forEach((t) => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
      }
    });

    const balance = totalIncome - totalExpense;

    const chartData = Object.entries(expenseByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { totalIncome, totalExpense, balance, expenseByCategory: chartData };
  }, [transactions]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Parsed Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t, index) => {
                    const Icon = categoryIcons[t.category as keyof typeof categoryIcons] || categoryIcons.Other;
                    return (
                        <TableRow key={index}>
                            <TableCell>{format(new Date(t.date), 'dd MMM yyyy')}</TableCell>
                            <TableCell>{t.description}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className="flex items-center gap-2 w-fit">
                                    <Icon className="h-4 w-4" />
                                    {t.category}
                                </Badge>
                            </TableCell>
                            <TableCell className={cn("text-right font-medium", t.type === 'income' ? 'text-green-600' : 'text-red-600')}>
                                {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                            </TableCell>
                        </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                    <Pie
                        data={expenseByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={false}
                        outerRadius={80}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {expenseByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <p className="font-bold">{`${payload[0].name}: ${formatCurrency(payload[0].value as number)}`}</p>
                            </div>
                            )
                        }
                        return null
                        }}
                    />
                    <Legend />
                    </PieChart>
                </ResponsiveContainer>
             ) : (
                <div className="flex justify-center items-center h-[250px] text-muted-foreground">
                    <p>No expense data to display.</p>
                </div>
             )}
          </CardContent>
        </Card>
      </div>
      
      <CardFooter className="flex justify-end gap-2 pt-6">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm}>Confirm and Add Transactions</Button>
      </CardFooter>
    </div>
  );
}
