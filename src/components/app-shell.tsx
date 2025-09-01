// 'use client';

// import { useTransactions } from '@/hooks/use-transactions';
// import { AddTransactionDialog } from './add-transaction-dialog';
// import { VoiceInputDialog } from './voice-input-dialog';
// import { ImportStatementDialog } from './import-statement-dialog';
// import { Dashboard } from './dashboard';
// import { FinancialTips } from './financial-tips';
// import { TransactionList } from './transaction-list';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
// import { Wallet, LogOut } from 'lucide-react';
// import type { Transaction } from '@/lib/types';
// import { Skeleton } from './ui/skeleton';
// import { useMemo } from 'react';
// import { Button } from './ui/button';
// import { useAuth } from '@/hooks/use-auth';

// const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//     }).format(amount);
// };

// function AppSkeleton() {
//   return (
//     <div className="flex min-h-screen w-full flex-col bg-muted/40">
//       <main className="flex-1 space-y-6 p-4 md:p-8">
//         <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//           <div>
//             <Skeleton className="h-8 w-48 mb-2" />
//             <Skeleton className="h-4 w-64" />
//           </div>
//           <div className="flex items-center gap-2">
//             <Skeleton className="h-10 w-[175px]" />
//             <Skeleton className="h-10 w-[170px]" />
//             <Skeleton className="h-10 w-[170px]" />
//             <Skeleton className="h-10 w-[120px]" />
//           </div>
//         </header>

//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Income</CardTitle>
//               <Wallet className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <Skeleton className="h-8 w-3/4" />
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
//               <Wallet className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <Skeleton className="h-8 w-3/4" />
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Balance</CardTitle>
//               <Wallet className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <Skeleton className="h-8 w-3/4" />
//             </CardContent>
//           </Card>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
//           <div className="lg:col-span-3">
//             <Skeleton className="h-96" />
//           </div>
//           <div className="lg:col-span-2 space-y-6">
//             <Skeleton className="h-96" />
//             <Skeleton className="h-64" />
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }

// export default function AppShell() {
//   const { transactions, addTransaction, deleteTransaction, deleteAllTransactions, isLoaded, addMultipleTransactions } = useTransactions();
//   const { user, signOut, loading: authLoading } = useAuth();
  
//   const handleAddTransaction = (data: Omit<Transaction, 'id' | 'date' | 'currency'> & { date: Date | string }) => {
//     const date = typeof data.date === 'string' ? data.date : data.date.toISOString();
//     addTransaction({
//       ...data,
//       date,
//     });
//   };

//   const totalIncome = useMemo(() => transactions
//     .filter((t) => t.type === 'income')
//     .reduce((sum, t) => sum + t.amount, 0), [transactions]);

//   const totalExpense = useMemo(() => transactions
//     .filter((t) => t.type === 'expense')
//     .reduce((sum, t) => sum + t.amount, 0), [transactions]);

//   const balance = totalIncome - totalExpense;

//   if (authLoading || !isLoaded || !user) {
//     return <AppSkeleton />;
//   }

//   return (
//     <div className="flex min-h-screen w-full flex-col bg-muted/40">
//       <main className="flex-1 space-y-6 p-4 md:p-8">
//         <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight font-headline text-primary">
//               FinTrack AI
//             </h1>
//             <p className="text-muted-foreground">
//               Welcome, {user?.email}!
//             </p>
//           </div>
//           <div className="flex items-center gap-2">
//             <AddTransactionDialog addTransaction={handleAddTransaction} />
//             <VoiceInputDialog addTransaction={handleAddTransaction} />
//             <ImportStatementDialog addMultipleTransactions={addMultipleTransactions} />
//             <Button variant="outline" onClick={signOut}>
//               <LogOut className="mr-2 h-4 w-4" />
//               Sign Out
//             </Button>
//           </div>
//         </header>
        
//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Income</CardTitle>
//               <span className="text-green-500">
//                 <Wallet className="h-4 w-4 text-muted-foreground" />
//               </span>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-green-600 flex items-center">
//                 {formatCurrency(totalIncome)}
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
//                <span className="text-red-500">
//                 <Wallet className="h-4 w-4 text-muted-foreground" />
//               </span>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-red-600 flex items-center">
//                  {formatCurrency(totalExpense)}
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Balance</CardTitle>
//               <Wallet className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold flex items-center">
//                  {formatCurrency(balance)}
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
//             <div className="lg:col-span-3">
//                 <TransactionList 
//                   transactions={transactions} 
//                   deleteTransaction={deleteTransaction} 
//                   deleteAllTransactions={deleteAllTransactions} 
//                 />
//             </div>
//             <div className="lg:col-span-2 space-y-6">
//                  <Dashboard transactions={transactions} />
//                  <FinancialTips transactions={transactions} />
//             </div>
//         </div>

//       </main>
//     </div>
//   );
// }

'use client';

import { useTransactions } from '@/hooks/use-transactions';
import { AddTransactionDialog } from './add-transaction-dialog';
import { VoiceInputDialog } from './voice-input-dialog';
import { ImportStatementDialog } from './import-statement-dialog';
import { Dashboard } from './dashboard';
import { FinancialTips } from './financial-tips';
import { TransactionList } from './transaction-list';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Wallet, LogOut, PlusCircle } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { useMemo } from 'react';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useBudgets } from '@/hooks/use-budgets';
import { BudgetList } from './budget-list';
import { AddBudgetDialog } from './add-budget-dialog';


const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
};

function AppSkeleton() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="flex-1 space-y-6 p-4 md:p-8">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-[175px]" />
            <Skeleton className="h-10 w-[170px]" />
            <Skeleton className="h-10 w-[170px]" />
            <Skeleton className="h-10 w-[120px]" />
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-3/4" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-3/4" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-3/4" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <Skeleton className="h-96" />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AppShell() {
  const { transactions, addTransaction, deleteTransaction, deleteAllTransactions, isLoaded, addMultipleTransactions } = useTransactions();
  const { budgets, addBudget, deleteBudget, isLoaded: budgetsLoaded } = useBudgets();
  const { user, signOut, loading: authLoading } = useAuth();
  
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

  if (authLoading || !isLoaded || !user || !budgetsLoaded) {
    return <AppSkeleton />;
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
              Welcome, {user?.email}!
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <AddTransactionDialog addTransaction={handleAddTransaction} />
            <AddBudgetDialog addBudget={addBudget} />
            <VoiceInputDialog addTransaction={handleAddTransaction} />
            <ImportStatementDialog addMultipleTransactions={addMultipleTransactions} />
            <Button variant="outline" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
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

        <div className="space-y-6">
            <BudgetList budgets={budgets} transactions={transactions} deleteBudget={deleteBudget} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
                <TransactionList 
                  transactions={transactions} 
                  deleteTransaction={deleteTransaction} 
                  deleteAllTransactions={deleteAllTransactions} 
                />
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
