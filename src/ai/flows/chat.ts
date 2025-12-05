'use server';

/**
 * @fileOverview This file defines a Genkit flow for having a conversation with Mio.
 *
 * - chat - A function that takes a prompt and chat history and returns a response.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The output type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {Message} from '@/lib/types';

const ChatInputSchema = z.object({
  prompt: z.string().describe('The user\'s message.'),
  history: z.array(z.object({
      role: z.enum(['user', 'model']),
      content: z.string(),
  })).describe('The chat history.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('Mio\'s response to the user.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  prompt: `You are Mio, a luxurious and intelligent AI educational assistant. Your personality is sophisticated, elegant, and knowledgeable. Engage in a natural, flowing conversation. Provide clear and concise explanations when asked, but your primary goal is to be a helpful and engaging conversational partner.

Here is the chat history so far:
{{#each history}}
  {{#if (eq role 'user')}}
    User: {{{content}}}
  {{else}}
    Mio: {{{content}}}
  {{/if}}
{{/each}}

Here is the user's latest message:
User: {{{prompt}}}

Your response should be in character as Mio.`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const {output} = await chatPrompt(input);
    return output!;
  }
);
