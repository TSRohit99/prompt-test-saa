import Dexie, { type EntityTable } from "dexie";
import type {
  ChatSession,
  MindScanRecord,
  PromptMode,
  RunHistoryEntry,
  ShadowAnalysisRecord,
} from "@/lib/types";
import type { QuestionSetRecord } from "@/lib/types/questions";

interface AppSettings {
  key: string;
  mode: PromptMode;
  openaiOptions: Record<string, unknown>;
}

class AlpagoDB extends Dexie {
  chatSessions!: EntityTable<ChatSession, "scanId">;
  mindScans!: EntityTable<MindScanRecord, "id">;
  shadowAnalyses!: EntityTable<ShadowAnalysisRecord, "id">;
  runHistory!: EntityTable<RunHistoryEntry, "id">;
  questionSets!: EntityTable<QuestionSetRecord, "id">;
  settings!: EntityTable<AppSettings, "key">;

  constructor() {
    super("alpago-gpt");
    this.version(1).stores({
      chatSessions: "scanId",
      mindScans: "++id, scanId, createdAt",
      shadowAnalyses: "++id, scanId, createdAt",
      runHistory: "++id, mode, timestamp",
      settings: "key",
    });
    this.version(2).stores({
      chatSessions: "scanId",
      mindScans: "++id, scanId, createdAt",
      shadowAnalyses: "++id, scanId, createdAt",
      runHistory: "++id, mode, timestamp",
      questionSets: "++id, status, createdAt",
      settings: "key",
    });
  }
}

export const db = new AlpagoDB();

export function sortRunHistory(entries: RunHistoryEntry[]): RunHistoryEntry[] {
  return [...entries].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.timestamp - a.timestamp;
  });
}

export async function deleteRunHistoryEntry(id: number): Promise<void> {
  await db.runHistory.delete(id);
}

export async function toggleRunHistoryPin(
  entry: RunHistoryEntry
): Promise<RunHistoryEntry | null> {
  if (entry.id == null) return null;
  const updated: RunHistoryEntry = { ...entry, pinned: !entry.pinned };
  await db.runHistory.put(updated);
  return updated;
}

export async function getLatestMindScan(): Promise<MindScanRecord | undefined> {
  return db.mindScans.orderBy("createdAt").last();
}

export async function getNextScanId(): Promise<number> {
  const last = await db.mindScans.orderBy("scanId").last();
  return last ? last.scanId + 1 : 1;
}

export async function getLatestAnsweredQuestionSet(): Promise<
  QuestionSetRecord | undefined
> {
  return db.questionSets
    .where("status")
    .equals("answered")
    .sortBy("answeredAt")
    .then((sets) => sets[sets.length - 1]);
}

export async function getLatestQuestionSet(): Promise<
  QuestionSetRecord | undefined
> {
  return db.questionSets.orderBy("createdAt").last();
}

export async function exportAllData(): Promise<string> {
  const [chatSessions, mindScans, shadowAnalyses, runHistory, questionSets] =
    await Promise.all([
      db.chatSessions.toArray(),
      db.mindScans.toArray(),
      db.shadowAnalyses.toArray(),
      db.runHistory.toArray(),
      db.questionSets.toArray(),
    ]);
  return JSON.stringify(
    { chatSessions, mindScans, shadowAnalyses, runHistory, questionSets },
    null,
    2
  );
}

export async function importAllData(json: string): Promise<void> {
  const data = JSON.parse(json);
  await db.transaction(
    "rw",
    [
      db.chatSessions,
      db.mindScans,
      db.shadowAnalyses,
      db.runHistory,
      db.questionSets,
    ],
    async () => {
      if (data.chatSessions?.length) {
        await db.chatSessions.bulkPut(data.chatSessions);
      }
      if (data.mindScans?.length) {
        await db.mindScans.bulkPut(data.mindScans);
      }
      if (data.shadowAnalyses?.length) {
        await db.shadowAnalyses.bulkPut(data.shadowAnalyses);
      }
      if (data.runHistory?.length) {
        await db.runHistory.bulkPut(data.runHistory);
      }
      if (data.questionSets?.length) {
        await db.questionSets.bulkPut(data.questionSets);
      }
    }
  );
}

export async function clearAllData(): Promise<void> {
  await db.transaction(
    "rw",
    [
      db.chatSessions,
      db.mindScans,
      db.shadowAnalyses,
      db.runHistory,
      db.questionSets,
    ],
    async () => {
      await db.chatSessions.clear();
      await db.mindScans.clear();
      await db.shadowAnalyses.clear();
      await db.runHistory.clear();
      await db.questionSets.clear();
    }
  );
}
