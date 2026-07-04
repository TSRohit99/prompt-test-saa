import type { ChatMessage, LatestSummary } from "@/lib/types";

export function computeMsgCount(messages: ChatMessage[]): number {
  return Math.floor(messages.length / 2);
}

export function shouldSummarize(
  msgCount: number,
  latestSummary: LatestSummary
): boolean {
  const expectedSummaryId = Math.floor(msgCount / 10);
  return expectedSummaryId > latestSummary.id;
}

export function buildContext(
  messages: ChatMessage[],
  msgCount: number,
  latestSummary: LatestSummary
): string {
  const sliceCount = msgCount % 10;

  if (latestSummary.id === 0) {
    return JSON.stringify(messages, null, 2);
  }
  if (sliceCount === 0) {
    return latestSummary.summary;
  }
  const recentMessages = JSON.stringify(
    messages.slice(-(sliceCount + 1)),
    null,
    2
  );
  return (
    latestSummary.summary +
    "\n\nUser Latest Message History:\n" +
    recentMessages
  );
}

export function getNextSummaryAt(msgCount: number): number {
  return (Math.floor(msgCount / 10) + 1) * 10;
}
