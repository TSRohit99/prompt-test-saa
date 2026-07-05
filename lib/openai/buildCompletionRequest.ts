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

export function buildChatCompletionRequest(
  input: CompletionRequestInput
): OpenAI.Chat.ChatCompletionCreateParams {
  const caps = getModelCapabilities(input.model);

  const tokenLimit = caps.maxCompletionTokens
    ? { max_completion_tokens: input.maxTokens }
    : { max_tokens: input.maxTokens };

  return {
    model: input.model,
    messages: [
      { role: "system", content: input.systemPrompt },
      { role: "user", content: input.userPrompt },
    ],
    ...tokenLimit,
    ...(caps.customTemperature ? { temperature: input.temperature } : {}),
    ...(input.responseFormat ? { response_format: input.responseFormat } : {}),
  } as OpenAI.Chat.ChatCompletionCreateParams;
}
