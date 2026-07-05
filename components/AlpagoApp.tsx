"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatThread } from "@/components/ChatThread";
import { OutputPanel } from "@/components/OutputPanel";
import { QuestionAnswerForm } from "@/components/QuestionAnswerForm";
import { ShadowAnswerForm } from "@/components/ShadowAnswerForm";
import { ParamsPanel } from "@/components/ParamsPanel";
import { PromptEditor } from "@/components/PromptEditor";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import {
  DEFAULT_OPENAI_OPTIONS,
  MINDSCAN_QUESTION_OPENAI_OPTIONS,
  SHADOW_OPENAI_OPTIONS,
} from "@/lib/constants/mindscan";
import { getShadowQuestionsForCategory } from "@/lib/constants/shadowAnalysisQuestions";
import {
  buildBeliefDetectorPrompts,
  buildMirrorPrompts,
} from "@/lib/flows/analyzeAnswers";
import {
  buildResponsePrompts,
  buildSummaryPrompts,
  computeMsgCount,
  prepareChatTurn,
} from "@/lib/flows/chat";
import {
  buildQuestionsPrompts,
  parseQuestionsResponse,
} from "@/lib/flows/questions";
import {
  buildShadowPrompts,
  validateShadowReport,
} from "@/lib/flows/shadow";
import { postChat } from "@/lib/openai/client";
import { sanitizeChatResponse } from "@/lib/utils/sanitizeChatResponse";
import { formatBeliefsForPrompt } from "@/lib/utils/beliefFormatters";
import { convertToJson } from "@/lib/utils/convertToJson";
import { getTopTags } from "@/lib/utils/getTopTags";
import { normalizeToGeneratedQuestions } from "@/lib/utils/questionHelpers";
import {
  db,
  deleteRunHistoryEntry,
  exportAllData,
  getLatestAnsweredQuestionSet,
  getLatestMindScan,
  getNextScanId,
  importAllData,
  clearAllData,
  sortRunHistory,
  toggleRunHistoryPin,
} from "@/lib/storage/db";
import {
  addSessionCost,
  getApiKey,
  getModel,
  getSessionCost,
  getStoredMode,
  resetSessionCost,
  setApiKey,
  setModel,
  setStoredMode,
} from "@/lib/storage/settings";
import {
  clearAllModePromptSnapshots,
  getModePromptSnapshot,
  saveModePromptSnapshot,
  type ModePromptSnapshot,
} from "@/lib/storage/modePrompts";
import {
  SAMPLE_ANSWERS,
  SAMPLE_MINDSCAN,
  SAMPLE_PREVIOUS_BELIEFS,
  SAMPLE_PREVIOUS_EXPERIENCE,
  SAMPLE_SHADOW_ANSWERS,
  SAMPLE_TAGS,
} from "@/fixtures/sampleData";
import type {
  Belief,
  ChatSession,
  MindScanCategory,
  MindScanRecord,
  OpenAIOptions,
  PromptMode,
  PromptPair,
  RunHistoryEntry,
  ShadowAnswer,
} from "@/lib/types";
import { DEFAULT_GURU_WELCOME, MINDSCAN_CATEGORIES } from "@/lib/types";
import type {
  QuestionAnswerWithTags,
  QuestionSetRecord,
} from "@/lib/types/questions";

const EMPTY_ANSWERS: QuestionAnswerWithTags[] = [];

function getDefaultOpenaiOptionsForMode(mode: PromptMode): OpenAIOptions {
  switch (mode) {
    case "questions":
      return MINDSCAN_QUESTION_OPENAI_OPTIONS;
    case "shadow":
      return SHADOW_OPENAI_OPTIONS;
    default:
      return DEFAULT_OPENAI_OPTIONS;
  }
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="font-medium text-zinc-500">{label}</span>
      {children}
    </label>
  );
}

export function AlpagoApp() {
  const [mode, setMode] = useState<PromptMode>(
    (getStoredMode() as PromptMode) || "questions"
  );
  const [apiKey, setApiKeyState] = useState("");
  const [model, setModelState] = useState("gpt-4o-mini");
  const [sessionCost, setSessionCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestResponse, setLatestResponse] = useState<string | null>(null);
  const [runs, setRuns] = useState<RunHistoryEntry[]>([]);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [mirrorSystemPrompt, setMirrorSystemPrompt] = useState("");
  const [mirrorUserPrompt, setMirrorUserPrompt] = useState("");
  const [analyzePromptTarget, setAnalyzePromptTarget] = useState<
    "belief" | "mirror"
  >("belief");
  const [openaiOptions, setOpenaiOptions] = useState<OpenAIOptions>(
    MINDSCAN_QUESTION_OPENAI_OPTIONS
  );
  const defaultPromptsRef = useRef<PromptPair>({ systemPrompt: "", userPrompt: "" });
  const defaultMirrorPromptsRef = useRef<PromptPair>({
    systemPrompt: "",
    userPrompt: "",
  });
  const promptDirtyRef = useRef({ system: false, user: false });
  const mirrorPromptDirtyRef = useRef({ system: false, user: false });
  const skipPersistRef = useRef(false);
  const isFirstModeEffectRef = useRef(true);
  const hasPersistedOnceRef = useRef(false);
  const modeRef = useRef<PromptMode>(mode);
  modeRef.current = mode;

  // Questions params
  const [category, setCategory] = useState<MindScanCategory>(
    MINDSCAN_CATEGORIES[0]
  );
  const [previousExperience, setPreviousExperience] = useState("");
  const [previousBeliefsJson, setPreviousBeliefsJson] = useState("[]");
  const [activeQuestionSet, setActiveQuestionSet] =
    useState<QuestionSetRecord | null>(null);
  const [questionSets, setQuestionSets] = useState<QuestionSetRecord[]>([]);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [selectedQuestionSetId, setSelectedQuestionSetId] = useState<
    number | ""
  >("");

  // Analyze params
  const [answersJson, setAnswersJson] = useState("[]");
  const [categoriesJson, setCategoriesJson] = useState(
    JSON.stringify([MINDSCAN_CATEGORIES[0]])
  );
  const [tagsJson, setTagsJson] = useState("[]");

  // Chat params
  const [scanId, setScanId] = useState("1");
  const [userMessage, setUserMessage] = useState("");
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [chatCategories, setChatCategories] = useState(
    JSON.stringify([MINDSCAN_CATEGORIES[0]])
  );
  const [chatTags, setChatTags] = useState(JSON.stringify(SAMPLE_TAGS));
  const [chatBeliefs, setChatBeliefs] = useState(
    JSON.stringify(SAMPLE_PREVIOUS_BELIEFS)
  );
  const [forceSummary, setForceSummary] = useState(false);

  // Shadow params
  const [mindScans, setMindScans] = useState<MindScanRecord[]>([]);
  const [selectedScanId, setSelectedScanId] = useState<number | "">("");
  const [shadowAnswers, setShadowAnswers] = useState<ShadowAnswer[]>([]);
  const [showShadowAnswerForm, setShowShadowAnswerForm] = useState(false);
  const shadowScanKeyRef = useRef("");

  useEffect(() => {
    setApiKeyState(getApiKey());
    setModelState(getModel());
    setSessionCost(getSessionCost());
    loadRuns();
    loadMindScans();
    loadQuestionSets();
    loadChatSession("1");
  }, []);

  const loadQuestionSets = async () => {
    const sets = await db.questionSets.orderBy("createdAt").toArray();
    setQuestionSets(sets);
    const latest = sets[sets.length - 1];
    if (latest) {
      setActiveQuestionSet(latest);
      if (!selectedQuestionSetId) {
        setSelectedQuestionSetId(latest.id ?? "");
      }
    }
  };

  const applyQuestionSetToAnalyze = (set: QuestionSetRecord) => {
    if (!set.answers?.length) return;
    setAnswersJson(JSON.stringify(set.answers, null, 2));
    setCategoriesJson(JSON.stringify(set.categories, null, 2));
    setTagsJson(JSON.stringify(set.tags ?? [], null, 2));
    setPreviousExperience(set.previousExperience);
    setPreviousBeliefsJson(JSON.stringify(set.previousBeliefs, null, 2));
  };

  const loadRuns = async () => {
    const history = await db.runHistory.toArray();
    setRuns(sortRunHistory(history));
  };

  const handleDeleteRun = async (id: number) => {
    await deleteRunHistoryEntry(id);
    setRuns((prev) => sortRunHistory(prev.filter((r) => r.id !== id)));
  };

  const handleTogglePin = async (entry: RunHistoryEntry) => {
    const updated = await toggleRunHistoryPin(entry);
    if (!updated) return;
    setRuns((prev) =>
      sortRunHistory(prev.map((r) => (r.id === updated.id ? updated : r)))
    );
  };

  const loadMindScans = async () => {
    const scans = await db.mindScans.orderBy("createdAt").toArray();
    setMindScans(scans);
    if (scans.length && !selectedScanId) {
      setSelectedScanId(scans[scans.length - 1].scanId);
    }
  };

  const selectedScan =
    mindScans.find((s) => s.scanId === selectedScanId) ?? null;
  const shadowQuestions =
    getShadowQuestionsForCategory(selectedScan?.categories[0]) ?? [];

  useEffect(() => {
    const key = selectedScan
      ? `${selectedScan.scanId}-${selectedScan.categories[0]}`
      : "";
    if (shadowScanKeyRef.current && key && key !== shadowScanKeyRef.current) {
      setShadowAnswers([]);
    }
    shadowScanKeyRef.current = key;
  }, [selectedScan]);

  const loadChatSession = async (id: string) => {
    let session = await db.chatSessions.get(id);
    if (!session) {
      session = {
        scanId: id,
        messages: [DEFAULT_GURU_WELCOME],
        latestSummary: { id: 0, summary: "" },
        msgCount: 0,
      };
      await db.chatSessions.put(session);
    }
    setChatSession(session);
  };

  const recordRun = async (
    label: string,
    result: Awaited<ReturnType<typeof postChat>>,
    system: string,
    user: string
  ) => {
    const entry: RunHistoryEntry = {
      mode,
      label,
      model: result.model,
      prompt_tokens: result.usage.prompt_tokens,
      completion_tokens: result.usage.completion_tokens,
      total_tokens: result.usage.total_tokens,
      cost: result.cost,
      latencyMs: result.latencyMs,
      timestamp: Date.now(),
      systemPrompt: system,
      userPrompt: user,
      response: result.content,
      pinned: false,
    };
    const id = await db.runHistory.add(entry);
    entry.id = id as number;
    setRuns((prev) => sortRunHistory([...prev, entry]));
    const total = addSessionCost(result.cost);
    setSessionCost(total);
    return result;
  };

  const syncDefaultPrompts = useCallback((pair: PromptPair) => {
    defaultPromptsRef.current = pair;
    if (!promptDirtyRef.current.system) setSystemPrompt(pair.systemPrompt);
    if (!promptDirtyRef.current.user) setUserPrompt(pair.userPrompt);
  }, []);

  const syncMirrorDefaultPrompts = useCallback((pair: PromptPair) => {
    defaultMirrorPromptsRef.current = pair;
    if (!mirrorPromptDirtyRef.current.system) {
      setMirrorSystemPrompt(pair.systemPrompt);
    }
    if (!mirrorPromptDirtyRef.current.user) {
      setMirrorUserPrompt(pair.userPrompt);
    }
  }, []);

  const buildSnapshot = useCallback((): ModePromptSnapshot => {
    return {
      systemPrompt,
      userPrompt,
      mirrorSystemPrompt,
      mirrorUserPrompt,
      analyzePromptTarget,
      dirty: { ...promptDirtyRef.current },
      mirrorDirty: { ...mirrorPromptDirtyRef.current },
      defaultSystemPrompt: defaultPromptsRef.current.systemPrompt,
      defaultUserPrompt: defaultPromptsRef.current.userPrompt,
      defaultMirrorSystemPrompt: defaultMirrorPromptsRef.current.systemPrompt,
      defaultMirrorUserPrompt: defaultMirrorPromptsRef.current.userPrompt,
      openaiOptions,
    };
  }, [
    systemPrompt,
    userPrompt,
    mirrorSystemPrompt,
    mirrorUserPrompt,
    analyzePromptTarget,
    openaiOptions,
  ]);

  const applySnapshot = useCallback((snapshot: ModePromptSnapshot) => {
    skipPersistRef.current = true;
    defaultPromptsRef.current = {
      systemPrompt: snapshot.defaultSystemPrompt,
      userPrompt: snapshot.defaultUserPrompt,
    };
    defaultMirrorPromptsRef.current = {
      systemPrompt: snapshot.defaultMirrorSystemPrompt,
      userPrompt: snapshot.defaultMirrorUserPrompt,
    };
    promptDirtyRef.current = { ...snapshot.dirty };
    mirrorPromptDirtyRef.current = { ...snapshot.mirrorDirty };
    setSystemPrompt(snapshot.systemPrompt);
    setUserPrompt(snapshot.userPrompt);
    setMirrorSystemPrompt(snapshot.mirrorSystemPrompt);
    setMirrorUserPrompt(snapshot.mirrorUserPrompt);
    setAnalyzePromptTarget(snapshot.analyzePromptTarget);
    setOpenaiOptions(snapshot.openaiOptions);
  }, []);

  const rebuildPromptsForMode = useCallback(() => {
    try {
      if (mode === "questions") {
        const beliefs = JSON.parse(previousBeliefsJson) as Belief[];
        syncDefaultPrompts(
          buildQuestionsPrompts(
            category,
            previousExperience,
            formatBeliefsForPrompt(beliefs)
          )
        );
      } else if (mode === "analyze") {
        const params = {
          answers: JSON.parse(answersJson),
          categories: JSON.parse(categoriesJson),
          tags: JSON.parse(tagsJson),
          previousExperience,
          previousBeliefs: JSON.parse(previousBeliefsJson) as Belief[],
        };
        syncDefaultPrompts(buildBeliefDetectorPrompts(params));
        syncMirrorDefaultPrompts(buildMirrorPrompts(params));
      } else if (mode === "chat") {
        if (!chatSession) return;
        const ctx = {
          categories: JSON.parse(chatCategories),
          tags: JSON.parse(chatTags),
          identifiedBeliefs: JSON.parse(chatBeliefs),
        };
        const context = userMessage
          ? prepareChatTurn(
              { ...chatSession, ...ctx },
              userMessage
            ).responsePrompts
          : buildResponsePrompts(
              "(preview)",
              JSON.stringify(chatSession.messages, null, 2),
              ctx
            );
        syncDefaultPrompts(context);
      } else if (mode === "shadow") {
        const scan: MindScanRecord = selectedScan ?? {
          ...SAMPLE_MINDSCAN,
          scanId: 0,
          createdAt: 0,
        };
        syncDefaultPrompts(
          buildShadowPrompts(
            scan,
            shadowAnswers.length > 0 ? shadowAnswers : SAMPLE_SHADOW_ANSWERS
          )
        );
      }
    } catch {
      // invalid JSON while typing — skip rebuild
    }
  }, [
    mode,
    category,
    previousExperience,
    previousBeliefsJson,
    answersJson,
    categoriesJson,
    tagsJson,
    chatSession,
    chatCategories,
    chatTags,
    chatBeliefs,
    userMessage,
    mindScans,
    selectedScanId,
    selectedScan,
    shadowAnswers,
    syncDefaultPrompts,
    syncMirrorDefaultPrompts,
  ]);

  useEffect(() => {
    rebuildPromptsForMode();
  }, [rebuildPromptsForMode]);

  useEffect(() => {
    const saved = getModePromptSnapshot(mode);
    if (saved) {
      applySnapshot(saved);
    } else if (!isFirstModeEffectRef.current) {
      promptDirtyRef.current = { system: false, user: false };
      mirrorPromptDirtyRef.current = { system: false, user: false };
      setOpenaiOptions(getDefaultOpenaiOptionsForMode(mode));
    } else {
      // First load: drop json_object on modes that don't use it (stale localStorage)
      const defaults = getDefaultOpenaiOptionsForMode(mode);
      if (!defaults.response_format && openaiOptions.response_format) {
        setOpenaiOptions(defaults);
      }
    }
    isFirstModeEffectRef.current = false;
  }, [mode, applySnapshot]);

  useEffect(() => {
    if (skipPersistRef.current) {
      skipPersistRef.current = false;
      return;
    }
    if (!hasPersistedOnceRef.current) {
      hasPersistedOnceRef.current = true;
      return;
    }
    saveModePromptSnapshot(modeRef.current, buildSnapshot());
  }, [
    systemPrompt,
    userPrompt,
    mirrorSystemPrompt,
    mirrorUserPrompt,
    analyzePromptTarget,
    openaiOptions,
    buildSnapshot,
  ]);

  const handleModeChange = (m: PromptMode) => {
    saveModePromptSnapshot(mode, buildSnapshot());
    if (!getModePromptSnapshot(m)) {
      promptDirtyRef.current = { system: false, user: false };
      mirrorPromptDirtyRef.current = { system: false, user: false };
    }
    setMode(m);
    setStoredMode(m);
    setError(null);
    setLatestResponse(null);
  };

  const handleSend = async () => {
    const key = getApiKey();
    if (!key) {
      setError("Save your OpenAI API key first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === "questions") {
        const result = await postChat({
          apiKey: key,
          model,
          systemPrompt,
          userPrompt,
          options: openaiOptions,
        });
        await recordRun("Questions", result, systemPrompt, userPrompt);
        const parsed = parseQuestionsResponse(result.content);
        const questions = normalizeToGeneratedQuestions(parsed);
        const beliefs = JSON.parse(previousBeliefsJson) as Belief[];

        const record: QuestionSetRecord = {
          category,
          categories: [category],
          previousExperience,
          previousBeliefs: beliefs,
          questions,
          status: "generated",
          createdAt: Date.now(),
        };
        const id = await db.questionSets.add(record);
        record.id = id as number;
        setActiveQuestionSet(record);
        setSelectedQuestionSetId(id as number);
        setShowAnswerForm(false);
        await loadQuestionSets();

        setLatestResponse(JSON.stringify(questions, null, 2));
      } else if (mode === "analyze") {
        const params = {
          answers: JSON.parse(answersJson),
          categories: JSON.parse(categoriesJson),
          tags: JSON.parse(tagsJson),
          previousExperience,
          previousBeliefs: JSON.parse(previousBeliefsJson) as Belief[],
        };

        const [beliefResult, mirrorResult] = await Promise.all([
          postChat({
            apiKey: key,
            model,
            systemPrompt,
            userPrompt,
            options: openaiOptions,
          }),
          postChat({
            apiKey: key,
            model,
            systemPrompt: mirrorSystemPrompt,
            userPrompt: mirrorUserPrompt,
            options: openaiOptions,
          }),
        ]);

        await recordRun("Belief Detector", beliefResult, systemPrompt, userPrompt);
        await recordRun(
          "Mirror Result",
          mirrorResult,
          mirrorSystemPrompt,
          mirrorUserPrompt
        );

        const beliefs = convertToJson(beliefResult.content);
        const mirror = convertToJson(mirrorResult.content) as {
          report?: unknown[];
        };
        const scanIdNum = await getNextScanId();

        const record: MindScanRecord = {
          scanId: scanIdNum,
          categories: params.categories,
          tags: params.tags,
          identifiedBeliefs: beliefs as Belief[],
          mirrorResult: mirror?.report ?? null,
          mindScanAnswers: params.answers,
          previousExperience,
          createdAt: Date.now(),
        };
        await db.mindScans.add(record);
        await loadMindScans();

        setLatestResponse(
          JSON.stringify({ beliefs, mirrorResult: mirror?.report }, null, 2)
        );
      } else if (mode === "chat") {
        if (!chatSession || !userMessage.trim()) {
          throw new Error("Enter a user message.");
        }

        const ctx = {
          categories: JSON.parse(chatCategories),
          tags: JSON.parse(chatTags),
          identifiedBeliefs: JSON.parse(chatBeliefs),
        };
        const session = { ...chatSession, ...ctx };
        const turn = prepareChatTurn(session, userMessage.trim());

        let updatedSummary = { ...session.latestSummary };

        if (turn.needsSummary || forceSummary) {
          const summaryPrompts = buildSummaryPrompts(
            turn.summaryMessages,
            session.latestSummary.summary,
            ctx.categories
          );
          const summaryResult = await postChat({
            apiKey: key,
            model,
            systemPrompt: summaryPrompts.systemPrompt,
            userPrompt: summaryPrompts.userPrompt,
            options: openaiOptions,
          });
          await recordRun(
            "Chat Summary",
            summaryResult,
            summaryPrompts.systemPrompt,
            summaryPrompts.userPrompt
          );
          const expectedId = Math.floor(
            computeMsgCount(session.messages) / 10
          );
          updatedSummary = {
            id: forceSummary
              ? Math.max(expectedId, session.latestSummary.id + 1)
              : expectedId,
            summary: summaryResult.content,
          };
        }

        const responseResult = await postChat({
          apiKey: key,
          model,
          systemPrompt,
          userPrompt,
          options: openaiOptions,
        });
        await recordRun("Chat Response", responseResult, systemPrompt, userPrompt);

        const guruContent = sanitizeChatResponse(responseResult.content);

        const updatedMessages = [
          ...session.messages,
          {
            role: "user" as const,
            content: userMessage.trim(),
            timeStamp: Date.now(),
          },
          {
            role: "guru" as const,
            content: guruContent,
            timeStamp: Date.now(),
          },
        ];

        const updated: ChatSession = {
          ...session,
          messages: updatedMessages,
          latestSummary: updatedSummary,
          msgCount: Math.floor(updatedMessages.length / 2),
        };
        await db.chatSessions.put(updated);
        setChatSession(updated);
        setUserMessage("");
        setForceSummary(false);
        setLatestResponse(guruContent);
      } else if (mode === "shadow") {
        const scan = selectedScan;
        if (!scan) throw new Error("Select a MindScan first.");
        if (!scan.mirrorResult?.length) {
          throw new Error("MindScan must have mirror result.");
        }
        if (shadowAnswers.length !== 5) {
          throw new Error("Answer all 5 shadow questions first.");
        }
        const prompts = buildShadowPrompts(scan, shadowAnswers);

        const result = await postChat({
          apiKey: key,
          model,
          systemPrompt: prompts.systemPrompt,
          userPrompt: prompts.userPrompt,
          options: openaiOptions,
        });
        await recordRun(
          "Shadow Analysis",
          result,
          prompts.systemPrompt,
          prompts.userPrompt
        );

        const parsed = convertToJson(result.content) as {
          report?: Record<string, string>;
        };
        const report = parsed?.report;
        if (!report || !validateShadowReport(report)) {
          throw new Error("Invalid shadow analysis report from model.");
        }

        await db.shadowAnalyses.add({
          scanId: scan.scanId,
          category: scan.categories[0] ?? "Unknown",
          report: {
            shadowName: report.shadowName.trim(),
            hiddenPartReflection: report.hiddenPartReflection.trim(),
            whyItWentHidden: report.whyItWentHidden.trim(),
            howItShowsUp: report.howItShowsUp.trim(),
            howToHold: report.howToHold.trim(),
            finalQuestion: report.finalQuestion.trim(),
          },
          createdAt: Date.now(),
        });

        setLatestResponse(JSON.stringify(parsed, null, 2));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveShadowAnswers = (answers: ShadowAnswer[]) => {
    setShadowAnswers(answers);
    setShowShadowAnswerForm(false);
    setError(null);
  };

  const handleSaveAnswers = async (answers: QuestionAnswerWithTags[]) => {
    if (!activeQuestionSet?.id) return;
    const tags = getTopTags(answers);
    const updated: QuestionSetRecord = {
      ...activeQuestionSet,
      answers,
      tags,
      status: "answered",
      answeredAt: Date.now(),
    };
    await db.questionSets.put(updated);
    setActiveQuestionSet(updated);
    setShowAnswerForm(false);
    await loadQuestionSets();
  };

  const handleUseInAnalyze = (set?: QuestionSetRecord) => {
    const target =
      set ??
      questionSets.find((s) => s.id === selectedQuestionSetId) ??
      activeQuestionSet;
    if (!target?.answers?.length) {
      setError("Save answers first before using in Analyze.");
      return;
    }
    applyQuestionSetToAnalyze(target);
    setMode("analyze");
    setStoredMode("analyze");
    setError(null);
  };

  const loadFixture = () => {
    if (mode === "questions") {
      setPreviousExperience(SAMPLE_PREVIOUS_EXPERIENCE);
      setPreviousBeliefsJson(JSON.stringify(SAMPLE_PREVIOUS_BELIEFS, null, 2));
    } else if (mode === "analyze") {
      setAnswersJson(JSON.stringify(SAMPLE_ANSWERS, null, 2));
      setCategoriesJson(JSON.stringify(SAMPLE_MINDSCAN.categories, null, 2));
      setTagsJson(JSON.stringify(SAMPLE_TAGS, null, 2));
      setPreviousExperience(SAMPLE_PREVIOUS_EXPERIENCE);
      setPreviousBeliefsJson(JSON.stringify(SAMPLE_PREVIOUS_BELIEFS, null, 2));
    } else if (mode === "chat") {
      setChatCategories(JSON.stringify(SAMPLE_MINDSCAN.categories, null, 2));
      setChatTags(JSON.stringify(SAMPLE_TAGS, null, 2));
      setChatBeliefs(JSON.stringify(SAMPLE_PREVIOUS_BELIEFS, null, 2));
      setUserMessage("I keep feeling like even when money comes, I can't relax.");
    } else if (mode === "shadow") {
      setShadowAnswers(SAMPLE_SHADOW_ANSWERS);
    }
  };

  const handleExport = async () => {
    const json = await exportAllData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alpago-session-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      await importAllData(text);
      await loadRuns();
      await loadMindScans();
      await loadQuestionSets();
      await loadChatSession(scanId);
    };
    input.click();
  };

  const handleClearData = async () => {
    if (!confirm("Clear all IndexedDB data?")) return;
    await clearAllData();
    clearAllModePromptSnapshots();
    setRuns([]);
    setMindScans([]);
    setQuestionSets([]);
    setActiveQuestionSet(null);
    setChatSession(null);
    await loadChatSession(scanId);
  };

  const renderParams = () => {
    const textareaClass =
      "w-full rounded-md border border-zinc-300 bg-zinc-50 p-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900";

    if (mode === "questions") {
      return (
        <>
          <Field label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as MindScanCategory)}
              className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              {MINDSCAN_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Previous experience">
            <textarea
              value={previousExperience}
              onChange={(e) => setPreviousExperience(e.target.value)}
              rows={3}
              className={textareaClass}
            />
          </Field>
          <Field label="Previous beliefs (JSON array)">
            <textarea
              value={previousBeliefsJson}
              onChange={(e) => setPreviousBeliefsJson(e.target.value)}
              rows={6}
              className={textareaClass}
            />
          </Field>

          {activeQuestionSet && (
            <div className="rounded-md border border-zinc-200 p-2 text-xs dark:border-zinc-800">
              <p className="font-medium">
                Saved set #{activeQuestionSet.id} · {activeQuestionSet.status}
              </p>
              <p className="mt-1 text-zinc-500">
                {activeQuestionSet.questions.length} questions
                {activeQuestionSet.status === "answered" &&
                  ` · ${activeQuestionSet.answers?.length} answers`}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowAnswerForm(true)}
                  className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
                >
                  Answer questions
                </button>
                {activeQuestionSet.status === "answered" && (
                  <button
                    type="button"
                    onClick={() => handleUseInAnalyze(activeQuestionSet)}
                    className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
                  >
                    Use in Analyze
                  </button>
                )}
              </div>
            </div>
          )}

          {questionSets.length > 1 && (
            <Field label="Saved question sets">
              <select
                value={selectedQuestionSetId}
                onChange={(e) => {
                  const id = e.target.value ? Number(e.target.value) : "";
                  setSelectedQuestionSetId(id);
                  const found = questionSets.find((s) => s.id === id);
                  if (found) setActiveQuestionSet(found);
                }}
                className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                {questionSets.map((s) => (
                  <option key={s.id} value={s.id}>
                    #{s.id} · {s.category} · {s.status}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </>
      );
    }

    if (mode === "analyze") {
      return (
        <>
          <Field label="From answered questions">
            <select
              value={selectedQuestionSetId}
              onChange={(e) =>
                setSelectedQuestionSetId(
                  e.target.value ? Number(e.target.value) : ""
                )
              }
              className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="">Select a set…</option>
              {questionSets
                .filter((s) => s.status === "answered")
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    #{s.id} · {s.category} ·{" "}
                    {new Date(s.answeredAt ?? s.createdAt).toLocaleString()}
                  </option>
                ))}
            </select>
          </Field>
          <button
            type="button"
            onClick={() => {
              const set = questionSets.find(
                (s) => s.id === selectedQuestionSetId
              );
              if (set) applyQuestionSetToAnalyze(set);
            }}
            disabled={!selectedQuestionSetId}
            className="rounded border border-zinc-300 px-2 py-1 text-xs disabled:opacity-40 dark:border-zinc-700"
          >
            Load into analyze fields
          </button>
          <button
            type="button"
            onClick={async () => {
              const latest = await getLatestAnsweredQuestionSet();
              if (latest) {
                setSelectedQuestionSetId(latest.id ?? "");
                applyQuestionSetToAnalyze(latest);
              }
            }}
            className="text-xs text-zinc-500 underline"
          >
            Load latest answered set
          </button>
          <Field label="Answers (JSON)">
            <textarea
              value={answersJson}
              onChange={(e) => setAnswersJson(e.target.value)}
              rows={8}
              className={textareaClass}
            />
          </Field>
          <Field label="Categories (JSON)">
            <textarea
              value={categoriesJson}
              onChange={(e) => setCategoriesJson(e.target.value)}
              rows={2}
              className={textareaClass}
            />
          </Field>
          <Field label="Tags (JSON)">
            <textarea
              value={tagsJson}
              onChange={(e) => setTagsJson(e.target.value)}
              rows={3}
              className={textareaClass}
            />
          </Field>
          <Field label="Previous experience">
            <textarea
              value={previousExperience}
              onChange={(e) => setPreviousExperience(e.target.value)}
              rows={2}
              className={textareaClass}
            />
          </Field>
          <Field label="Previous beliefs (JSON)">
            <textarea
              value={previousBeliefsJson}
              onChange={(e) => setPreviousBeliefsJson(e.target.value)}
              rows={5}
              className={textareaClass}
            />
          </Field>
          <button
            type="button"
            onClick={async () => {
              const last = await getLatestMindScan();
              if (last?.identifiedBeliefs) {
                setPreviousBeliefsJson(
                  JSON.stringify(last.identifiedBeliefs, null, 2)
                );
              }
            }}
            className="text-xs underline text-zinc-500"
          >
            Fill previous beliefs from latest MindScan
          </button>
        </>
      );
    }

    if (mode === "chat") {
      return (
        <>
          <Field label="Scan ID">
            <input
              value={scanId}
              onChange={(e) => setScanId(e.target.value)}
              onBlur={() => loadChatSession(scanId)}
              className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </Field>
          <Field label="User message">
            <textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              rows={3}
              className={textareaClass}
              placeholder="Type a message and click Send"
            />
          </Field>
          <Field label="Categories (JSON)">
            <textarea
              value={chatCategories}
              onChange={(e) => setChatCategories(e.target.value)}
              rows={2}
              className={textareaClass}
            />
          </Field>
          <Field label="Tags (JSON)">
            <textarea
              value={chatTags}
              onChange={(e) => setChatTags(e.target.value)}
              rows={3}
              className={textareaClass}
            />
          </Field>
          <Field label="Identified beliefs (JSON)">
            <textarea
              value={chatBeliefs}
              onChange={(e) => setChatBeliefs(e.target.value)}
              rows={5}
              className={textareaClass}
            />
          </Field>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={forceSummary}
              onChange={(e) => setForceSummary(e.target.checked)}
            />
            Force summary on next send
          </label>
        </>
      );
    }

    if (mode === "shadow") {
      const answeredCount = shadowAnswers.filter((a) => a.answer?.trim()).length;
      return (
        <>
          <Field label="MindScan">
            <select
              value={selectedScanId}
              onChange={(e) =>
                setSelectedScanId(
                  e.target.value ? Number(e.target.value) : ""
                )
              }
              className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="">Select a scan…</option>
              {mindScans.map((s) => (
                <option key={s.scanId} value={s.scanId}>
                  Scan #{s.scanId} — {s.categories[0]}
                </option>
              ))}
            </select>
          </Field>
          {mindScans.length === 0 && (
            <p className="text-xs text-amber-600">
              Run Analyze Answers first to create a MindScan.
            </p>
          )}
          {selectedScan && (
            <>
              <p className="text-xs text-zinc-500">
                Category: {selectedScan.categories[0]}
              </p>
              {shadowQuestions.length === 0 ? (
                <p className="text-xs text-amber-600">
                  No shadow questions for this MindScan category.
                </p>
              ) : (
                <>
                  <p className="text-xs text-zinc-500">
                    Shadow answers: {answeredCount}/5
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowShadowAnswerForm(true)}
                    disabled={!shadowQuestions.length}
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
                  >
                    {answeredCount === 5 ? "Edit shadow answers" : "Answer shadow questions"}
                  </button>
                  {answeredCount === 5 && (
                    <div className="space-y-1 rounded-md border border-zinc-100 p-2 dark:border-zinc-800">
                      {shadowAnswers.map((a, i) => (
                        <p key={i} className="text-xs text-zinc-600 dark:text-zinc-400">
                          <span className="font-medium">Layer {i + 1}:</span>{" "}
                          {a.answer}
                        </p>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
      );
    }

    return null;
  };

  return (
    <div className="flex h-screen flex-col">
      <TopBar
        apiKey={apiKey}
        model={model}
        sessionCost={sessionCost}
        onApiKeyChange={setApiKeyState}
        onApiKeySave={() => setApiKey(apiKey)}
        onModelChange={(m) => {
          setModelState(m);
          setModel(m);
        }}
        onResetCost={() => {
          resetSessionCost();
          setSessionCost(0);
        }}
      />

      <div className="flex min-h-0 flex-1">
        <Sidebar
          mode={mode}
          onModeChange={handleModeChange}
          onExport={handleExport}
          onImport={handleImport}
          onClearData={handleClearData}
        />

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-auto p-4 lg:grid-cols-3">
            <ParamsPanel
              mode={mode}
              model={model}
              openaiOptions={openaiOptions}
              onOpenAIOptionsChange={setOpenaiOptions}
              onSend={handleSend}
              onLoadFixture={loadFixture}
              loading={loading}
              sendLabel={mode === "chat" ? "Send message" : "Send"}
            >
              {renderParams()}
            </ParamsPanel>

            <PromptEditor
              systemPrompt={
                mode === "analyze" && analyzePromptTarget === "mirror"
                  ? mirrorSystemPrompt
                  : systemPrompt
              }
              userPrompt={
                mode === "analyze" && analyzePromptTarget === "mirror"
                  ? mirrorUserPrompt
                  : userPrompt
              }
              onSystemChange={(v) => {
                if (mode === "analyze" && analyzePromptTarget === "mirror") {
                  mirrorPromptDirtyRef.current.system = true;
                  setMirrorSystemPrompt(v);
                } else {
                  promptDirtyRef.current.system = true;
                  setSystemPrompt(v);
                }
              }}
              onUserChange={(v) => {
                if (mode === "analyze" && analyzePromptTarget === "mirror") {
                  mirrorPromptDirtyRef.current.user = true;
                  setMirrorUserPrompt(v);
                } else {
                  promptDirtyRef.current.user = true;
                  setUserPrompt(v);
                }
              }}
              onReset={() => {
                if (mode === "analyze" && analyzePromptTarget === "mirror") {
                  mirrorPromptDirtyRef.current = { system: false, user: false };
                  setMirrorSystemPrompt(
                    defaultMirrorPromptsRef.current.systemPrompt
                  );
                  setMirrorUserPrompt(
                    defaultMirrorPromptsRef.current.userPrompt
                  );
                } else {
                  promptDirtyRef.current = { system: false, user: false };
                  setSystemPrompt(defaultPromptsRef.current.systemPrompt);
                  setUserPrompt(defaultPromptsRef.current.userPrompt);
                }
              }}
              onCopy={() =>
                navigator.clipboard.writeText(
                  mode === "analyze" && analyzePromptTarget === "mirror"
                    ? `SYSTEM:\n${mirrorSystemPrompt}\n\nUSER:\n${mirrorUserPrompt}`
                    : `SYSTEM:\n${systemPrompt}\n\nUSER:\n${userPrompt}`
                )
              }
              headerExtra={
                mode === "analyze" ? (
                  <div className="flex gap-1">
                    {(["belief", "mirror"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAnalyzePromptTarget(t)}
                        className={`rounded px-2 py-0.5 text-xs capitalize ${
                          analyzePromptTarget === t
                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                            : "border border-zinc-300 dark:border-zinc-700"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                ) : undefined
              }
            />

            <OutputPanel
              loading={loading}
              error={error}
              latestResponse={latestResponse}
              runs={runs}
              onDeleteRun={handleDeleteRun}
              onTogglePin={handleTogglePin}
            />
          </div>

          {mode === "questions" &&
            showAnswerForm &&
            activeQuestionSet?.id != null && (
              <QuestionAnswerForm
                questionSetId={activeQuestionSet.id}
                questions={activeQuestionSet.questions}
                initialAnswers={activeQuestionSet.answers ?? EMPTY_ANSWERS}
                onSave={handleSaveAnswers}
                onCancel={() => setShowAnswerForm(false)}
              />
            )}

          {mode === "shadow" &&
            showShadowAnswerForm &&
            selectedScan &&
            shadowQuestions.length > 0 && (
              <ShadowAnswerForm
                scanKey={`${selectedScan.scanId}-${selectedScan.categories[0]}`}
                questions={shadowQuestions}
                initialAnswers={shadowAnswers}
                onSave={handleSaveShadowAnswers}
                onCancel={() => setShowShadowAnswerForm(false)}
              />
            )}

          {mode === "chat" && chatSession && (
            <ChatThread
              messages={chatSession.messages}
              msgCount={chatSession.msgCount}
              summaryId={chatSession.latestSummary.id}
              summaryPreview={chatSession.latestSummary.summary}
            />
          )}
        </main>
      </div>
    </div>
  );
}
