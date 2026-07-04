import type { ChatCompletionResult, OpenAIOptions } from "@/lib/types";
import { calculateCost } from "./pricing";

export interface PostChatParams {
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  options?: OpenAIOptions;
}

export async function postChat(
  params: PostChatParams
): Promise<ChatCompletionResult> {
  const start = Date.now();
  const res = await fetch("/api/openai/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify({
      model: params.model,
      systemPrompt: params.systemPrompt,
      userPrompt: params.userPrompt,
      options: params.options,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "OpenAI request failed");
  }

  const latencyMs = Date.now() - start;
  const usage = data.usage ?? {
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0,
  };

  return {
    content: data.content,
    usage,
    cost: calculateCost(
      params.model,
      usage.prompt_tokens,
      usage.completion_tokens
    ),
    latencyMs,
    model: data.model ?? params.model,
  };
}
