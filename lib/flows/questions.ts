import {
  MINDSCAN_QUESTION_COUNT,
  MINDSCAN_QUESTION_OPENAI_OPTIONS,
} from "@/lib/constants/mindscan";
import { getQuestionsPrompts } from "@/lib/prompts";
import { convertToJson } from "@/lib/utils/convertToJson";
import type { MindScanCategory } from "@/lib/types";
import type { PromptPair } from "@/lib/types";

export function buildQuestionsPrompts(
  category: MindScanCategory,
  previousExperience: string,
  previousBeliefsStr: string
): PromptPair {
  const prompts = getQuestionsPrompts(
    category,
    previousExperience,
    previousBeliefsStr
  );
  return {
    systemPrompt: prompts.generateQuestionsSysPrompt,
    userPrompt: prompts.generateQuestionsUsrPrompt,
  };
}

export function normalizeQuestionsPayload(parsed: unknown) {
  const obj = parsed as Record<string, unknown>;
  const list = Array.isArray(parsed)
    ? parsed
    : Array.isArray(obj?.questions)
      ? obj.questions
      : null;

  if (!list?.length) {
    throw new Error("Invalid questions format from model");
  }

  return list.slice(0, MINDSCAN_QUESTION_COUNT).map((q, index) => ({
    ...(q as Record<string, unknown>),
    questionId: String(index + 1),
  }));
}

export function parseQuestionsResponse(raw: string) {
  return normalizeQuestionsPayload(convertToJson(raw));
}

export { MINDSCAN_QUESTION_OPENAI_OPTIONS };
