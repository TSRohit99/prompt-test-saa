export type PromptMode = "chat" | "questions" | "analyze" | "shadow";

export interface ChatMessage {
  role: "user" | "guru";
  content: string;
  timeStamp: number;
}

export interface LatestSummary {
  id: number;
  summary: string;
}

export interface ChatSession {
  scanId: string;
  messages: ChatMessage[];
  latestSummary: LatestSummary;
  msgCount: number;
  categories?: string[] | null;
  tags?: unknown;
  identifiedBeliefs?: unknown;
}

export interface MindScanAnswer {
  question: string;
  answer: string;
  note?: string;
}

export interface Belief {
  belief: string;
  intensity: number;
  category: string;
  improvement?: { percentage: number; originalIntensity: number };
}

export interface MindScanRecord {
  id?: number;
  scanId: number;
  categories: string[];
  tags: Array<{ id: string; text: string } | string>;
  identifiedBeliefs: Belief[];
  mirrorResult: unknown[] | null;
  mindScanAnswers: MindScanAnswer[];
  previousExperience?: string;
  createdAt: number;
}

export interface ShadowAnswer {
  questionIndex?: number;
  question: string;
  answer: string;
}

export interface ShadowAnalysisRecord {
  id?: number;
  scanId: number;
  category: string;
  report: {
    shadowName: string;
    hiddenPartReflection: string;
    whyItWentHidden: string;
    howItShowsUp: string;
    howToHold: string;
    finalQuestion: string;
  };
  createdAt: number;
}

export interface OpenAIOptions {
  max_tokens?: number;
  temperature?: number;
  response_format?: { type: "json_object" };
  retries?: number;
  backoffMs?: number;
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ChatCompletionResult {
  content: string;
  usage: TokenUsage;
  cost: number;
  latencyMs: number;
  model: string;
}

export interface RunHistoryEntry {
  id?: number;
  mode: PromptMode;
  label: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost: number;
  latencyMs: number;
  timestamp: number;
  systemPrompt: string;
  userPrompt: string;
  response: string;
  pinned?: boolean;
}

export interface PromptPair {
  systemPrompt: string;
  userPrompt: string;
}

export const DEFAULT_GURU_WELCOME: ChatMessage = {
  role: "guru",
  content: `I'm Guru, not here to fix you, but to walk beside you.
If there's something you're feeling, thinking, or just trying to understand… tell me.
You don't have to say it perfectly. Just say it honestly.`,
  timeStamp: Date.now(),
};

export const MINDSCAN_CATEGORIES = [
  "Money & Abundance Beliefs",
  "Self Confidence & Self-Worth",
  "Relationships & Attachment Styles",
  "Lost Excitement Or Traumatic Experiences",
] as const;

export type MindScanCategory = (typeof MINDSCAN_CATEGORIES)[number];
