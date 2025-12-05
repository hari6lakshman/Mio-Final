'use server';

/**
 * @fileOverview This file defines a Genkit flow for having a conversation with Mio.
 *
 * - chat - A function that takes a prompt and chat history and returns a response.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The output type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ChatInputSchema = z.object({
  prompt: z.string().describe("The user's message."),
  history: z.array(z.object({
      role: z.enum(['user', 'model']),
      content: z.string(),
  })).describe('The chat history.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe("Mio's response to the user."),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

// Internal schema for the prompt, which includes the isUser flag
const PromptInputSchema = z.object({
    prompt: z.string(),
    history: z.array(z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
        isUser: z.boolean(), // The new flag
    })),
});

const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: PromptInputSchema}, // Use the internal schema
  output: {schema: ChatOutputSchema},
  prompt: `You are Mio, a luxurious and intelligent AI educational assistant. Your personality is sophisticated, elegant, and knowledgeable. Engage in a natural, flowing conversation. Provide clear and concise explanations when asked, but your primary goal is to be a helpful and engaging conversational partner.

Here is the chat history so far:
{{#each history}}
  {{#if this.isUser}}
    User: {{{this.content}}}
  {{else}}
    Mio: {{{this.content}}}
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
    // Process history to add the isUser flag
    const processedHistory = input.history.map(message => ({
      ...message,
      isUser: message.role === 'user',
    }));
    
    const {output} = await chatPrompt({
        prompt: input.prompt,
        history: processedHistory,
    });
    return output!;
  }
);
