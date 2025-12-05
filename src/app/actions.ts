'use server';

import { highlightKeyConcepts } from '@/ai/flows/highlight-key-concepts';
import { summarizeTopic } from '@/ai/flows/summarize-topic';
import { z } from 'zod';

const schema = z.object({
  prompt: z.string().min(1, { message: 'Please enter a message.' }),
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
  });

  if (!validatedFields.success) {
    return {
      promptId: prevState.promptId,
      mioResponse: null,
      error: validatedFields.error.flatten().fieldErrors.prompt?.[0] || "Validation failed",
    };
  }

  const prompt = validatedFields.data.prompt;
  const promptId = crypto.randomUUID();

  try {
    // 1. Get a summary for the user's topic
    const summaryResult = await summarizeTopic({ topic: prompt });

    if (!summaryResult.summary) {
        throw new Error('The AI could not generate a summary.');
    }
    
    // 2. Highlight key concepts in the summary
    const highlightedSummary = await highlightKeyConcepts(summaryResult.summary);
    
    return {
      promptId: promptId,
      mioResponse: highlightedSummary,
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
