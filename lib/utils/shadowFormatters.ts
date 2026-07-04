import type { MindScanAnswer, ShadowAnswer } from "@/lib/types";

export function formatMirrorResultForPrompt(
  mirrorResult: unknown[] | null
): string {
  if (!Array.isArray(mirrorResult) || mirrorResult.length === 0) {
    return "Not provided";
  }
  return mirrorResult
    .map((section) => {
      const s = section as Record<string, string>;
      if (s?.section === "pattern") {
        return [
          `Pattern: ${s.patternName || "Unknown"}`,
          s.patternDescription || "",
          s.currentFocus ? `Current focus: ${s.currentFocus}` : "",
        ]
          .filter(Boolean)
          .join("\n");
      }
      if (s?.section && s?.content) {
        const label =
          s.section.charAt(0).toUpperCase() + s.section.slice(1);
        return `${label}: ${s.content}`;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n\n");
}

export function getPatternNameFromMirror(
  mirrorResult: unknown[] | null
): string | null {
  if (!Array.isArray(mirrorResult)) return null;
  const pattern = mirrorResult.find(
    (s) => (s as Record<string, string>)?.section === "pattern"
  ) as Record<string, string> | undefined;
  return pattern?.patternName?.trim() || null;
}

export function formatMindScanAnswersForPrompt(
  answers: MindScanAnswer[] | null
): string {
  if (!Array.isArray(answers) || answers.length === 0) return "Not provided";
  const selected = answers
    .map((a, i) => `Q${i + 1}: ${a.question}\nAnswer: ${a.answer}`)
    .join("\n\n");
  const notes = answers
    .filter((a) => a.note?.trim())
    .map((a, i) => `Q${i + 1}: ${a.note!.trim()}`)
    .join("\n");
  if (notes) return `${selected}\n\nCustom notes:\n${notes}`;
  return selected;
}

export function formatShadowAnswersForPrompt(
  shadowAnswers: ShadowAnswer[]
): string {
  if (!Array.isArray(shadowAnswers) || shadowAnswers.length === 0) {
    return "Not provided";
  }
  return shadowAnswers
    .map(
      (a) =>
        `Q${(a.questionIndex ?? 0) + 1}: ${a.question}\nAnswer: ${a.answer}`
    )
    .join("\n\n");
}
