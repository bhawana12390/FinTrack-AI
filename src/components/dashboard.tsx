'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import type { Transaction, TransactionType } from '@/lib/types';
import { useMemo, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface DashboardProps {
  transactions: Transaction[];
}

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

const formatCurrencyForAxis = (value: number) => {
    if (value >= 1000) {
        return `₹${value / 1000}k`;
    }
    return `₹${value}`;
};

function CategoryBarChart({ data }: { data: { name: string; value: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center h-[300px] text-muted-foreground">
        <p>No data to display.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tickFormatter={formatCurrencyForAxis} />
          <YAxis dataKey="name" type="category" width={80} />
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted))' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Category
                        </span>
                        <span className="font-bold text-muted-foreground">
                          {payload[0].payload.name}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Amount
                        </span>
                        <span className="font-bold">
                           {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(payload[0].value as number)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar dataKey="value" layout="vertical" radius={[0, 4, 4, 0]}>
             {data.map((entry, index) => (
                <Rectangle key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
  );
}

function CategoryDonutChart({ data }: { data: { name: string; value: number }[] }) {
    if (data.length === 0) {
      return (
        <div className="flex justify-center items-center h-[300px] text-muted-foreground">
          <p>No data to display.</p>
        </div>
      );
    }
  
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={false}
            outerRadius={80}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <p className="font-bold">{`${payload[0].name}: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(payload[0].value as number)}`}</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

function IncomeExpenseLineChart({ data }: { data: { date: string, income: number, expense: number }[] }) {
    if (data.length === 0) {
        return (
          <div className="flex justify-center items-center h-[300px] text-muted-foreground">
            <p>Not enough data to display trend.</p>
          </div>
        );
      }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={formatCurrencyForAxis} />
                <Tooltip 
                    content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                            return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <p className='font-bold'>{label}</p>
                                <p className='text-green-600'>Income: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(payload[0].value as number)}</p>
                                <p className='text-red-600'>Expense: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(payload[1].value as number)}</p>
                            </div>
                            )
                        }
                        return null
                    }}
                />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="hsl(var(--chart-2))" strokeWidth={2} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="expense" stroke="hsl(var(--chart-5))" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    )
}

export function Dashboard({ transactions }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TransactionType | 'trends'>('expense');
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

  const categoryChartData = useMemo(() => {
    return (type: TransactionType) => {
      const dataByCategory = transactions
        .filter((t) => t.type === type)
        .reduce((acc, t) => {
          if (!acc[t.category]) {
            acc[t.category] = 0;
          }
          acc[t.category] += t.amount;
          return acc;
        }, {} as Record<string, number>);

      return Object.entries(dataByCategory)
        .map(([category, amount]) => ({
          name: category,
          value: amount,
        }))
        .sort((a, b) => b.value - a.value);
    };
  }, [transactions]);
  
  const expenseData = categoryChartData('expense');
  const incomeData = categoryChartData('income');

  const trendData = useMemo(() => {
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const dataByMonth = sortedTransactions.reduce((acc, t) => {
        const month = format(new Date(t.date), 'MMM yyyy');
        if (!acc[month]) {
            acc[month] = { date: month, income: 0, expense: 0 };
        }
        if (t.type === 'income') {
            acc[month].income += t.amount;
        } else {
            acc[month].expense += t.amount;
        }
        return acc;
    }, {} as Record<string, { date: string, income: number, expense: number }>);

    return Object.values(dataByMonth);
  }, [transactions]);

  const renderCategoryChart = (data: { name: string; value: number }[]) => {
    return chartType === 'bar' ? <CategoryBarChart data={data} /> : <CategoryDonutChart data={data} />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>A visual breakdown of your finances.</CardDescription>
          </div>
          {(activeTab === 'income' || activeTab === 'expense') && (
            <Select value={chartType} onValueChange={(value) => setChartType(value as 'bar' | 'pie')}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="pie">Donut Chart</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TransactionType | 'trends')} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="expense">Expenses</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          <TabsContent value="expense">
            {renderCategoryChart(expenseData)}
          </TabsContent>
          <TabsContent value="income">
            {renderCategoryChart(incomeData)}
          </TabsContent>
          <TabsContent value="trends">
            <IncomeExpenseLineChart data={trendData} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
