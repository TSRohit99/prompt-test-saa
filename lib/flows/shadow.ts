import { SHADOW_OPENAI_OPTIONS } from "@/lib/constants/mindscan";
import { shadowAnalysisPrompts } from "@/lib/prompts";
import { formatBeliefsForShadow } from "@/lib/utils/beliefFormatters";
import {
  formatMindScanAnswersForPrompt,
  formatMirrorResultForPrompt,
  formatShadowAnswersForPrompt,
  getPatternNameFromMirror,
} from "@/lib/utils/shadowFormatters";
import type { MindScanRecord, PromptPair, ShadowAnswer } from "@/lib/types";

export function buildShadowPrompts(
  scan: MindScanRecord,
  shadowAnswers: ShadowAnswer[]
): PromptPair {
  const category = scan.categories?.[0] ?? "Unknown";
  const dominantTags = Array.isArray(scan.tags)
    ? scan.tags.map((t) => (typeof t === "string" ? t : t.text)).join(", ")
    : "Not provided";

  const mindScanAnswers = scan.mindScanAnswers;
  const customTexts =
    Array.isArray(mindScanAnswers) &&
    mindScanAnswers.some((a) => a.note?.trim())
      ? mindScanAnswers
          .filter((a) => a.note?.trim())
          .map((a, i) => `Q${i + 1}: ${a.note!.trim()}`)
          .join("\n")
      : "No custom texts shared";

  const prompts = shadowAnalysisPrompts({
    category,
    mindscanResultReport: formatMirrorResultForPrompt(scan.mirrorResult),
    mindscanPatternName: getPatternNameFromMirror(scan.mirrorResult),
    dominantTags,
    selectedMindScanAnswers: formatMindScanAnswersForPrompt(mindScanAnswers),
    customTexts,
    transformationBeliefs: formatBeliefsForShadow(scan.identifiedBeliefs),
    shadowScanAnswers: formatShadowAnswersForPrompt(shadowAnswers),
  });

  return {
    systemPrompt: prompts.shadowAnalysisSysPrompt,
    userPrompt: prompts.shadowAnalysisUsrPrompt,
  };
}

export function validateShadowReport(report: Record<string, string>): boolean {
  return !!(
    report?.shadowName &&
    report?.hiddenPartReflection &&
    report?.whyItWentHidden &&
    report?.howItShowsUp &&
    report?.howToHold &&
    report?.finalQuestion
  );
}

export { SHADOW_OPENAI_OPTIONS };
