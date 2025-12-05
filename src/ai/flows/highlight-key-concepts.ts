'use server';

/**
 * @fileOverview This file defines a Genkit flow for highlighting key concepts in Mio's responses.
 *
 * It includes:
 * - `highlightKeyConcepts`: The main function to process the input text and highlight key concepts.
 * - `HighlightKeyConceptsInput`: The input type for the `highlightKeyConcepts` function, which is a string.
 * - `HighlightKeyConceptsOutput`: The output type for the `highlightKeyConcepts` function, which is also a string.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HighlightKeyConceptsInputSchema = z.object({
  text: z.string().describe('The input text to highlight key concepts in.'),
});
export type HighlightKeyConceptsInput = z.infer<typeof HighlightKeyConceptsInputSchema>;

const HighlightKeyConceptsOutputSchema = z.object({
    highlightedText: z.string().describe('The text with key concepts highlighted using markdown bold text.'),
});
export type HighlightKeyConceptsOutput = z.infer<typeof HighlightKeyConceptsOutputSchema>;

export async function highlightKeyConcepts(input: HighlightKeyConceptsInput): Promise<HighlightKeyConceptsOutput> {
  return highlightKeyConceptsFlow(input);
}

const highlightKeyConceptsPrompt = ai.definePrompt({
  name: 'highlightKeyConceptsPrompt',
  input: {schema: HighlightKeyConceptsInputSchema},
  output: {schema: HighlightKeyConceptsOutputSchema},
  prompt: `You are an AI assistant that specializes in identifying key concepts in text and marking them with markdown-style bold text (**) to highlight them.  Your task is to process the given text and highlight the most important concepts.

Text: {{{text}}}`,
});

const highlightKeyConceptsFlow = ai.defineFlow(
  {
    name: 'highlightKeyConceptsFlow',
    inputSchema: HighlightKeyConceptsInputSchema,
    outputSchema: HighlightKeyConceptsOutputSchema,
  },
  async input => {
    const {output} = await highlightKeyConceptsPrompt(input);
    return output!;
  }
);
