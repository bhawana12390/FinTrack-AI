'use server';
/**
 * @fileOverview Voice command transcription flow using Genkit and Whisper API.
 *
 * - transcribeVoiceCommand - A function that handles the voice command transcription process.
 */

import {ai} from '@/ai/genkit';
import {
  TranscribeVoiceCommandInputSchema,
  TranscribeVoiceCommandOutputSchema,
  type TranscribeVoiceCommandInput,
  type TranscribeVoiceCommandOutput,
} from '@/lib/types';

export async function transcribeVoiceCommand(input: TranscribeVoiceCommandInput): Promise<TranscribeVoiceCommandOutput> {
  return transcribeVoiceCommandFlow(input);
}

const prompt = ai.definePrompt({
  name: 'transcribeVoiceCommandPrompt',
  input: {schema: TranscribeVoiceCommandInputSchema},
  output: {schema: TranscribeVoiceCommandOutputSchema},
  prompt: `Transcribe the following voice command to text:

Voice Command: {{media url=audioDataUri}}`,
});

const transcribeVoiceCommandFlow = ai.defineFlow(
  {
    name: 'transcribeVoiceCommandFlow',
    inputSchema: TranscribeVoiceCommandInputSchema,
    outputSchema: TranscribeVoiceCommandOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
