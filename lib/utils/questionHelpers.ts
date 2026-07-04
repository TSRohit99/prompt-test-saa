import type { GeneratedQuestion } from "@/lib/types/questions";

export function normalizeToGeneratedQuestions(
  parsed: unknown[]
): GeneratedQuestion[] {
  return parsed.map((q, index) => {
    const item = q as Record<string, unknown>;
    const options = (item.options as Array<Record<string, unknown>>) ?? [];
    return {
      questionId: String(item.questionId ?? index + 1),
      text: String(item.text ?? item.question ?? ""),
      options: options.map((o) => ({
        text: String(o.text ?? o.label ?? ""),
        tags: Array.isArray(o.tags) ? (o.tags as string[]) : [],
      })),
    };
  });
}
