'use client';
import { useState } from 'react';
import type { Transaction } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Button, buttonVariants } from './ui/button';
import { MoreHorizontal, Trash2, ArrowUpDown, Download, Loader2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { categoryIcons } from './icons';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from './ui/calendar';
import { generatePdf } from '@/ai/flows/generate-pdf';
import { useToast } from '@/hooks/use-toast';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
};

interface TransactionListProps {
  transactions: Transaction[];
  deleteTransaction: (id: string) => void;
  deleteAllTransactions: () => void;
}

type SortKey = keyof Transaction | '';
type SortDirection = 'asc' | 'desc';
const ITEMS_PER_PAGE = 8;

export function TransactionList({ transactions, deleteTransaction, deleteAllTransactions }: TransactionListProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };
  
  const sortableKeys: SortKey[] = ['date', 'category', 'amount'];

  const filteredTransactions = transactions
    .filter((t) => {
      if (!dateRange?.from) return true;
      const transactionDate = new Date(t.date);
      if (dateRange.to) {
        return transactionDate >= dateRange.from && transactionDate <= dateRange.to;
      }
      return transactionDate >= dateRange.from;
    })
    .sort((a, b) => {
      if (!sortKey || !sortableKeys.includes(sortKey)) return 0;
      
      const valA = a[sortKey as keyof Transaction];
      const valB = b[sortKey as keyof Transaction];

      if (valA === undefined || valB === undefined) return 0;

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const SortableHeader = ({ tKey, label }: { tKey: SortKey, label: string }) => (
    <TableHead onClick={() => handleSort(tKey)} className="cursor-pointer">
      <div className="flex items-center gap-2">
        {label}
        {sortKey === tKey && <ArrowUpDown className="h-4 w-4" />}
      </div>
    </TableHead>
  );

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const result = await generatePdf({ transactions: JSON.stringify(filteredTransactions) });
      const link = document.createElement('a');
      link.href = result.pdfDataUri;
      link.download = `transactions-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: 'Success', description: 'Your transaction PDF has been downloaded.' });
    } catch (error) {
      console.error('Failed to download PDF:', error);
      toast({ variant: 'destructive', title: 'Download Failed', description: 'Could not generate the PDF. Please try again.' });
    } finally {
      setIsDownloading(false);
    }
  };
  
  const handleDeleteAll = () => {
    deleteAllTransactions();
    toast({
        title: "All transactions deleted",
        description: "Your transaction history has been cleared.",
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Transaction History</CardTitle>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={'outline'}
                  className={cn(
                    'w-[260px] justify-start text-left font-normal',
                    !dateRange && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'LLL dd, y')} -{' '}
                        {format(dateRange.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(dateRange.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="icon" onClick={handleDownloadPdf} disabled={isDownloading}>
                {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            </Button>
            {transactions.length > 0 && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all
                            your transaction data from our servers.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAll} className={buttonVariants({ variant: "destructive" })}>
                            Delete All
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader tKey="date" label="Date" />
                <TableHead>Description</TableHead>
                <SortableHeader tKey="category" label="Category" />
                <SortableHeader tKey="amount" label="Amount (INR)" />
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((t) => {
                  const Icon = categoryIcons[t.category];
                  const amount = t.amount < 0 ? t.amount * -1 : t.amount; // Ensure amount is positive
                  return (
                    <TableRow key={t.id}>
                      <TableCell>{format(new Date(t.date), 'dd MMM yyyy')}</TableCell>
                      <TableCell className="font-medium">{t.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-2 w-fit">
                          <Icon className="h-4 w-4" />
                          {t.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={cn(t.type === 'income' ? 'text-green-600' : 'text-red-600')}>
                          {t.type === 'income' ? '+' : '-'}
                          {formatCurrency(amount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => deleteTransaction(t.id)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No transactions yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {totalPages > 1 && (
        <CardFooter className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
            </span>
            <div className='flex items-center gap-2'>
                <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    Previous
                </Button>
                <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    Next
                </Button>
            </div>
        </CardFooter>
      )}
    </Card>
  );
}
