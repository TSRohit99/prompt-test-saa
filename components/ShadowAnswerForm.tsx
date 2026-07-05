"use client";

import { useEffect, useState } from "react";
import {
  SHADOW_ANSWER_MAX_LENGTH,
  type ShadowQuestion,
} from "@/lib/constants/shadowAnalysisQuestions";
import type { ShadowAnswer } from "@/lib/types";

const EMPTY_ANSWERS: ShadowAnswer[] = [];

interface ShadowAnswerFormProps {
  scanKey: string;
  questions: ShadowQuestion[];
  initialAnswers?: ShadowAnswer[];
  onSave: (answers: ShadowAnswer[]) => void;
  onCancel: () => void;
}

export function ShadowAnswerForm({
  scanKey,
  questions,
  initialAnswers = EMPTY_ANSWERS,
  onSave,
  onCancel,
}: ShadowAnswerFormProps) {
  const [answers, setAnswers] = useState<string[]>([]);

  useEffect(() => {
    const texts = questions.map((q) => {
      const found = initialAnswers.find((a) => a.question === q.text);
      return found?.answer ?? "";
    });
    setAnswers(texts);
  }, [scanKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateAnswer = (index: number, text: string) => {
    if (text.length > SHADOW_ANSWER_MAX_LENGTH) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = text;
      return next;
    });
  };

  const appendSuggestion = (index: number, suggestion: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      const existing = next[index]?.trim();
      next[index] = existing ? `${existing} ${suggestion}` : suggestion;
      return next;
    });
  };

  const handleSave = () => {
    const final = questions.map((q, index) => ({
      questionIndex: index,
      question: q.text,
      answer: answers[index]?.trim() ?? "",
    }));

    const missing = final.filter((a) => !a.answer).length;
    if (missing > 0) {
      alert(`Please answer all ${questions.length} shadow questions before saving.`);
      return;
    }

    onSave(final);
  };

  const answeredCount = answers.filter((a) => a.trim()).length;

  if (!questions.length) {
    return (
      <p className="text-sm text-zinc-500">
        No shadow questions for this MindScan category.
      </p>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h3 className="text-sm font-semibold">
            Shadow questions ({answeredCount}/{questions.length})
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Close
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {questions.map((q, i) => (
            <div
              key={`${scanKey}-${i}`}
              className="rounded-md border border-zinc-100 p-3 dark:border-zinc-800"
            >
              <p className="mb-2 text-sm font-medium">
                Layer {i + 1}. {q.text}
              </p>
              <textarea
                value={answers[i] ?? ""}
                onChange={(e) => updateAnswer(i, e.target.value)}
                rows={4}
                placeholder="Write whatever comes up…"
                className="w-full rounded-md border border-zinc-200 bg-zinc-50 p-2 text-xs dark:border-zinc-700 dark:bg-zinc-950"
              />
              <p className="mt-1 text-right text-[10px] text-zinc-400">
                {(answers[i] ?? "").length}/{SHADOW_ANSWER_MAX_LENGTH}
              </p>
              {q.suggestions.length > 0 && (
                <>
                  <p className="mt-2 text-xs text-zinc-500">You can think of:</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {q.suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => appendSuggestion(i, suggestion)}
                        className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
          <p className="text-center text-xs text-zinc-500">
            There are no right or wrong answers. Just be honest.
          </p>
        </div>

        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Save shadow answers
          </button>
        </div>
      </div>
    </div>
  );
}
