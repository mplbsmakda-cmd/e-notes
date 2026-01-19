'use server';
/**
 * @fileOverview A flow to summarize a note.
 *
 * - summarizeNote - A function that takes note content and returns a summary.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeNoteInputSchema = z.string();
const SummarizeNoteOutputSchema = z.string();

export async function summarizeNote(noteContent: string): Promise<string> {
  return summarizeNoteFlow(noteContent);
}

const summarizeNotePrompt = ai.definePrompt({
  name: 'summarizeNotePrompt',
  input: {schema: SummarizeNoteInputSchema},
  output: {schema: SummarizeNoteOutputSchema},
  prompt: `Anda adalah asisten AI yang sangat membantu untuk aplikasi pencatat bernama BukuCatatan. Tugas Anda adalah meringkas konten catatan yang diberikan oleh pengguna. Berikan ringkasan yang jelas dan ringkas dalam bahasa Indonesia.

Konten Catatan:
{{{input}}}

Ringkasan Anda:`,
});

const summarizeNoteFlow = ai.defineFlow(
  {
    name: 'summarizeNoteFlow',
    inputSchema: SummarizeNoteInputSchema,
    outputSchema: SummarizeNoteOutputSchema,
  },
  async (input) => {
    const {output} = await summarizeNotePrompt(input);
    if (!output) {
        throw new Error("AI tidak mengembalikan ringkasan.");
    }
    return output;
  }
);
