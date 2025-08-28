'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getFinancialTips } from '@/ai/flows/financial-tips';
import type { Transaction } from '@/lib/types';
import { Loader2, Lightbulb, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface FinancialTipsProps {
  transactions: Transaction[];
}

export function FinancialTips({ transactions }: FinancialTipsProps) {
  const [tips, setTips] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetTips = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (transactions.length === 0) {
        setError("There's no transaction data to analyze. Please add some transactions first.");
        setIsLoading(false);
        return;
      }
      const result = await getFinancialTips({
        transactionHistory: JSON.stringify(transactions),
      });
      setTips(result.tips);
    } catch (e) {
      console.error('Failed to get financial tips:', e);
      setError('An error occurred while generating tips. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Financial Advisor</CardTitle>
        <CardDescription>
          Get personalized financial tips based on your transaction history.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleGetTips} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
             <>
              <Lightbulb className="mr-2 h-4 w-4" />
              Generate Tips
            </>
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {tips.length > 0 && (
          <div className="space-y-2 rounded-lg border p-4">
            <h3 className="font-semibold text-lg">Your Personalized Tips:</h3>
            <ul className="list-disc space-y-2 pl-5">
              {tips.map((tip, index) => (
                <li key={index} className="text-sm text-foreground/90">{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
