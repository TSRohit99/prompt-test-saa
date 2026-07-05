import type OpenAI from "openai";
import { getModelCapabilities } from "./models";

export interface CompletionRequestInput {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens: number;
  temperature: number;
  responseFormat?: { type: "json_object" };
}

function messagesMentionJson(systemPrompt: string, userPrompt: string): boolean {
  return /\bjson\b/i.test(`${systemPrompt}\n${userPrompt}`);
}

/** OpenAI requires the word "json" in messages when using response_format json_object. */
function ensureJsonKeyword(
  systemPrompt: string,
  userPrompt: string
): { systemPrompt: string; userPrompt: string } {
  if (messagesMentionJson(systemPrompt, userPrompt)) {
    return { systemPrompt, userPrompt };
  }
  return {
    systemPrompt: `${systemPrompt.trim()}\n\nReturn your response as valid JSON.`,
    userPrompt,
  };
}

export function buildChatCompletionRequest(
  input: CompletionRequestInput
): OpenAI.Chat.ChatCompletionCreateParams {
  const caps = getModelCapabilities(input.model);

  const tokenLimit = caps.maxCompletionTokens
    ? { max_completion_tokens: input.maxTokens }
    : { max_tokens: input.maxTokens };

  const { systemPrompt, userPrompt } =
    input.responseFormat?.type === "json_object"
      ? ensureJsonKeyword(input.systemPrompt, input.userPrompt)
      : {
          systemPrompt: input.systemPrompt,
          userPrompt: input.userPrompt,
        };

  return {
    model: input.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    ...tokenLimit,
    ...(caps.customTemperature ? { temperature: input.temperature } : {}),
    ...(input.responseFormat ? { response_format: input.responseFormat } : {}),
  } as OpenAI.Chat.ChatCompletionCreateParams;
}
