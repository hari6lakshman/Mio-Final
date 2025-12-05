'use server';

import { highlightKeyConcepts } from '@/ai/flows/highlight-key-concepts';
import { chat } from '@/ai/flows/chat';
import { z } from 'zod';
import { type Message } from '@/lib/types';

const schema = z.object({
  prompt: z.string().min(1, { message: 'Please enter a message.' }),
  history: z.string(),
});

export type FormState = {
  promptId: string;
  mioResponse: string | null;
  error: string | null;
};

export async function getMioResponse(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = schema.safeParse({
    prompt: formData.get('prompt'),
    history: formData.get('history'),
  });

  if (!validatedFields.success) {
    return {
      promptId: prevState.promptId,
      mioResponse: null,
      error: validatedFields.error.flatten().fieldErrors.prompt?.[0] || "Validation failed",
    };
  }
  
  const { prompt, history } = validatedFields.data;
  const promptId = crypto.randomUUID();
  
  let parsedHistory: Message[] = [];
  try {
    parsedHistory = JSON.parse(history);
  } catch (e) {
    // ignore invalid history
  }


  try {
    const chatResult = await chat({
        prompt: prompt,
        history: parsedHistory
    });

    if (!chatResult.response) {
        throw new Error('The AI could not generate a response.');
    }
    
    const highlightResult = await highlightKeyConcepts({text: chatResult.response});
    
    if (!highlightResult.highlightedText) {
        throw new Error('The AI could not highlight key concepts.');
    }

    return {
      promptId: promptId,
      mioResponse: highlightResult.highlightedText,
      error: null,
    };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      promptId: promptId,
      mioResponse: null,
      error: `Mio encountered an error: ${errorMessage}`,
    };
  }
}
