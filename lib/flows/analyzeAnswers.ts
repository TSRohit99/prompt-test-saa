import { DEFAULT_OPENAI_OPTIONS } from "@/lib/constants/mindscan";
import {
  beliefDetectorPrompts,
  mirrorResultPrompts,
} from "@/lib/prompts";
import { formatBeliefsForPrompt } from "@/lib/utils/beliefFormatters";
import type { Belief, MindScanAnswer, PromptPair } from "@/lib/types";

export interface AnalyzeParams {
  answers: MindScanAnswer[];
  categories: string[];
  tags: Array<{ id: string; text: string } | string>;
  previousExperience: string;
  previousBeliefs: Belief[];
}

export function buildBeliefDetectorPrompts(
  params: AnalyzeParams
): PromptPair {
  const prompts = beliefDetectorPrompts(
    JSON.stringify(params.answers),
    JSON.stringify(params.categories)
  );
  return {
    systemPrompt: prompts.beliefDetectorSysPrompt,
    userPrompt: prompts.beliefDetectorUserPrompt,
  };
}

export function buildMirrorPrompts(params: AnalyzeParams): PromptPair {
  const category = params.categories[0] ?? "";
  const dominantTags = params.tags
    .slice(0, 2)
    .map((t) => (typeof t === "string" ? t : t.text))
    .join(", ");
  const selectedAnswers = params.answers
    .map((a, i) => `Q${i + 1}: ${a.question}\nAnswer: ${a.answer}`)
    .join("\n\n");
  const customTexts = params.answers
    .filter((a) => a.note?.trim())
    .map((a, i) => `Q${i + 1}: ${a.note!.trim()}`)
    .join("\n");

  const prompts = mirrorResultPrompts(
    category,
    params.previousExperience || null,
    dominantTags,
    selectedAnswers,
    customTexts || null,
    formatBeliefsForPrompt(params.previousBeliefs)
  );

  return {
    systemPrompt: prompts.mirrorResultSysPrompt,
    userPrompt: prompts.mirrorResultUsrPrompt,
  };
}

export { DEFAULT_OPENAI_OPTIONS };
