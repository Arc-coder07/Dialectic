import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { LanguageModel } from 'ai';

export function getModel(): LanguageModel {
  const provider = process.env.LLM_PROVIDER || 'google';
  const apiKey = process.env.LLM_API_KEY || '';
  const modelId = process.env.LLM_MODEL || 'gemini-2.5-flash';

  if (provider === 'openai') {
    const openai = createOpenAI({
      apiKey,
    });
    return openai(modelId);
  }

  // Default to Google
  const google = createGoogleGenerativeAI({
    apiKey,
  });
  return google(modelId);
}
