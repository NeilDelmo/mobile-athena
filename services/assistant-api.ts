import { apiRequest } from '@/services/api-client';

export type AssistantApiMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type AssistantApiResponse = {
  message: AssistantApiMessage;
  provider: string;
  model: string;
};

export async function requestAssistantReply(
  messages: AssistantApiMessage[],
  signal?: AbortSignal,
) {
  try {
    const payload = await apiRequest<AssistantApiResponse>('/chat', {
      method: 'POST',
      body: { messages },
      signal,
    });

    if (!payload.message?.content) {
      throw new Error('Ask Athena returned an empty response.');
    }

    return payload;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    throw error;
  }
}
