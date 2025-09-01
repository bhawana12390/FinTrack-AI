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
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { expenseCategories } from '@/lib/types';
import type { Budget } from '@/lib/types';
import { PlusCircle } from 'lucide-react';


interface AddBudgetDialogProps {
  addBudget: (budget: Omit<Budget, 'id'>) => void;
}

const formSchema = z.object({
    category: z.enum(expenseCategories, { required_error: "Please select a category." }),
    amount: z.coerce.number().positive({ message: 'Budget amount must be positive.' }),
});

type BudgetFormValues = z.infer<typeof formSchema>;


export function AddBudgetDialog({ addBudget }: AddBudgetDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 1000,
      category: 'Food',
    },
  });

  const handleSubmit = (values: BudgetFormValues) => {
    addBudget(values);
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a New Budget</DialogTitle>
          <DialogDescription>
            Set a monthly spending limit for a category to track your spending.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {expenseCategories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat}
                                </SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="1000" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button type="submit">Create Budget</Button>
                </div>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
