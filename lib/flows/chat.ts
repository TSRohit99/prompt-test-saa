import { DEFAULT_OPENAI_OPTIONS } from "@/lib/constants/mindscan";
import {
  buildContext,
  computeMsgCount,
  shouldSummarize,
} from "@/lib/context/chatContext";
import { createResponsePrompts, createSummaryPrompts } from "@/lib/prompts";
import type { ChatMessage, ChatSession, PromptPair } from "@/lib/types";

export interface ChatMindScanContext {
  categories?: string[] | null;
  tags?: unknown;
  identifiedBeliefs?: unknown;
}

export function buildSummaryPrompts(
  messages: ChatMessage[],
  previousSummary: string,
  categories?: string[] | null
): PromptPair {
  const prompts = createSummaryPrompts(messages, previousSummary, categories);
  return {
    systemPrompt: prompts.createSummarySysPrompt,
    userPrompt: prompts.createSummaryUsrPrompt,
  };
}

export function buildResponsePrompts(
  question: string,
  context: string,
  mindScan: ChatMindScanContext
): PromptPair {
  const prompts = createResponsePrompts(
    question,
    context,
    mindScan.identifiedBeliefs,
    mindScan.tags,
    mindScan.categories
  );
  return {
    systemPrompt: prompts.createResponseSysPrompt,
    userPrompt: prompts.createResponseUsrPrompt,
  };
}

export function prepareChatTurn(
  session: ChatSession,
  userMessage: string
): {
  needsSummary: boolean;
  summaryMessages: ChatMessage[];
  context: string;
  responsePrompts: PromptPair;
} {
  const msgCount = computeMsgCount(session.messages);
  const needsSummary = shouldSummarize(msgCount, session.latestSummary);
  const summaryMessages = session.messages.slice(-10);

  const messagesWithUser: ChatMessage[] = [
    ...session.messages,
    { role: "user", content: userMessage, timeStamp: Date.now() },
  ];

  const context = buildContext(
    messagesWithUser,
    msgCount,
    session.latestSummary
  );

  const responsePrompts = buildResponsePrompts(userMessage, context, {
    categories: session.categories,
    tags: session.tags,
    identifiedBeliefs: session.identifiedBeliefs,
  });

  return { needsSummary, summaryMessages, context, responsePrompts };
}

export { DEFAULT_OPENAI_OPTIONS, computeMsgCount, shouldSummarize, buildContext };
