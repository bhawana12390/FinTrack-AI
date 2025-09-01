'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Mic, MicOff, Loader2, Bot } from 'lucide-react';
import { transcribeVoiceCommand } from '@/ai/flows/voice-command-transcription';
import type { Transaction } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { categories } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface VoiceInputDialogProps {
  addTransaction: (transaction: Omit<Transaction, 'id' | 'currency'>) => void;
}

const PARSE_REGEX = /(expense|income)\s+([\d\.]+)\s+for\s+(\w+)\s*(.*)/i;

export function VoiceInputDialog({ addTransaction }: VoiceInputDialogProps) {
  const [open, setOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const handleStartRecording = async () => {
    setTranscribedText('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        audioChunksRef.current.push(event.data);
      });

      mediaRecorderRef.current.addEventListener('stop', handleStopRecording);

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({
        variant: 'destructive',
        title: 'Microphone Error',
        description: 'Could not access the microphone. Please check your browser permissions.',
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      // Stop all tracks to release microphone
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    if (audioChunksRef.current.length > 0) {
      transcribeAudio();
    }
  };

  const transcribeAudio = async () => {
    setIsTranscribing(true);
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64Audio = reader.result as string;
      try {
        const result = await transcribeVoiceCommand({ audioDataUri: base64Audio });
        setTranscribedText(result.transcription);
        parseAndAddTransaction(result.transcription);
      } catch (error) {
        console.error('Transcription failed:', error);
        toast({
          variant: 'destructive',
          title: 'Transcription Failed',
          description: 'Could not transcribe the audio. Please try again.',
        });
      } finally {
        setIsTranscribing(false);
      }
    };
  };

  const parseAndAddTransaction = (text: string) => {
    const match = text.toLowerCase().match(PARSE_REGEX);

    if (!match) {
      toast({
        variant: 'destructive',
        title: 'Parsing Error',
        description: `Could not understand the command: "${text}"`,
      });
      return;
    }

    const [, type, amountStr, categoryStr, description] = match;
    const category = categories.find(c => c.toLowerCase() === categoryStr.trim().toLowerCase());

    if (!category) {
       toast({
        variant: 'destructive',
        title: 'Invalid Category',
        description: `Category "${categoryStr}" is not recognized.`,
      });
      return;
    }

    const transaction = {
      type: type as 'income' | 'expense',
      amount: parseFloat(amountStr),
      category: category,
      description: description.trim() || category,
      date: new Date().toISOString(),
    };
    
    addTransaction(transaction);
    toast({
      title: 'Transaction Added!',
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} of ₹${transaction.amount.toFixed(2)} for ${transaction.category} added.`,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Mic className="mr-2 h-4 w-4" />
          Voice Command
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Voice Command</DialogTitle>
          <DialogDescription>
            Press the button and speak to log a transaction.
          </DialogDescription>
        </DialogHeader>
        <Alert>
          <Bot className="h-4 w-4" />
          <AlertTitle>Example Command</AlertTitle>
          <AlertDescription>
            "Expense 12.50 for Food lunch with friends"
          </AlertDescription>
        </Alert>
        <div className="flex justify-center items-center py-8">
          <Button
            size="icon"
            className="w-20 h-20 rounded-full"
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isTranscribing}
          >
            {isTranscribing ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : isRecording ? (
              <MicOff className="h-8 w-8" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </Button>
        </div>
        {transcribedText && (
          <div className="text-center text-sm text-muted-foreground">
            <p>Heard: "{transcribedText}"</p>
          </div>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
