import { Router } from 'express';

import { requireAuth } from '../auth-middleware.js';
import { config } from '../config.js';
import { HttpError } from '../http-error.js';

export const chatRouter = Router();

const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_TOTAL_LENGTH = 12000;
const ALLOWED_ROLES = new Set(['user', 'assistant']);

const systemPrompt = `You are Ask Athena, the friendly research support assistant inside the ATHENA university app.

Your role:
- Help faculty understand proposal sections, preparation steps, revision feedback, research calls, and how to use ATHENA.
- Give practical checklists and concise explanations in clear, approachable language.
- When a question depends on a university-specific rule or document that has not been provided, say that you do not have that policy and advise the user to verify it with the Research Office.
- Never claim to have reviewed an attachment, template, sample, policy, or live proposal unless its contents appear in the conversation.
- Never approve, reject, score, or make an official decision on a research proposal.
- Do not invent deadlines, funding amounts, people, or institutional policies.
- Protect privacy: discourage users from sharing confidential research data or personal information.

Keep most answers under 180 words. Use short bullets when they make the answer easier to scan.`;

function normalizeMessages(value) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new HttpError(400, 'messages must be a non-empty array.', 'VALIDATION_ERROR');
  }

  if (value.length > MAX_MESSAGES) {
    throw new HttpError(
      400,
      `messages must contain ${MAX_MESSAGES} items or fewer.`,
      'VALIDATION_ERROR',
    );
  }

  let totalLength = 0;
  const messages = value.map((message, index) => {
    if (!message || typeof message !== 'object' || !ALLOWED_ROLES.has(message.role)) {
      throw new HttpError(
        400,
        `messages[${index}].role must be user or assistant.`,
        'VALIDATION_ERROR',
      );
    }

    if (typeof message.content !== 'string' || message.content.trim().length === 0) {
      throw new HttpError(
        400,
        `messages[${index}].content is required.`,
        'VALIDATION_ERROR',
      );
    }

    const content = message.content.trim();

    if (content.length > MAX_MESSAGE_LENGTH) {
      throw new HttpError(
        400,
        `Each message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`,
        'VALIDATION_ERROR',
      );
    }

    totalLength += content.length;
    return { role: message.role, content };
  });

  if (totalLength > MAX_TOTAL_LENGTH) {
    throw new HttpError(
      400,
      'The conversation is too long. Start a new chat and try again.',
      'VALIDATION_ERROR',
    );
  }

  if (messages.at(-1)?.role !== 'user') {
    throw new HttpError(400, 'The last message must be from the user.', 'VALIDATION_ERROR');
  }

  return messages;
}

chatRouter.post('/', requireAuth, async (request, response) => {
  if (config.ai.provider !== 'groq') {
    throw new HttpError(503, 'The configured AI provider is unavailable.', 'AI_NOT_CONFIGURED');
  }

  if (!config.ai.apiKey) {
    throw new HttpError(
      503,
      'Ask Athena is not configured. Add GROQ_API_KEY to server/.env.',
      'AI_NOT_CONFIGURED',
    );
  }

  const messages = normalizeMessages(request.body.messages);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.ai.timeoutMs);

  let groqResponse;

  try {
    groqResponse = await fetch(`${config.ai.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.ai.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.ai.model,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.35,
        max_completion_tokens: 700,
        stream: false,
      }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new HttpError(504, 'Ask Athena took too long to respond.', 'AI_TIMEOUT');
    }

    throw new HttpError(502, 'Ask Athena could not reach the AI service.', 'AI_UNAVAILABLE');
  } finally {
    clearTimeout(timeout);
  }

  const result = await groqResponse.json().catch(() => null);

  if (!groqResponse.ok) {
    const isRateLimited = groqResponse.status === 429;
    throw new HttpError(
      isRateLimited ? 429 : 502,
      isRateLimited
        ? 'Ask Athena is busy right now. Please wait a moment and try again.'
        : 'The AI service could not complete the request.',
      isRateLimited ? 'AI_RATE_LIMITED' : 'AI_PROVIDER_ERROR',
    );
  }

  const content = result?.choices?.[0]?.message?.content;

  if (typeof content !== 'string' || content.trim().length === 0) {
    throw new HttpError(502, 'The AI service returned an empty response.', 'AI_EMPTY_RESPONSE');
  }

  response.json({
    message: { role: 'assistant', content: content.trim() },
    provider: config.ai.provider,
    model: config.ai.model,
  });
});
