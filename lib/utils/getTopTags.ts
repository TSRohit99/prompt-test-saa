import type { QuestionAnswerWithTags } from "@/lib/types/questions";

export function getTopTags(
  responses: QuestionAnswerWithTags[],
  count = 2
): Array<{ id: string; text: string }> {
  const tagFrequency: Record<string, number> = {};

  for (const response of responses) {
    for (const tag of response.tags ?? []) {
      tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
    }
  }

  const tagPairs = Object.entries(tagFrequency);
  tagPairs.sort((a, b) => b[1] - a[1]);

  return tagPairs.slice(0, count).map((pair, index) => ({
    id: (index + 1).toString(),
    text: pair[0].charAt(0).toUpperCase() + pair[0].slice(1),
  }));
}
