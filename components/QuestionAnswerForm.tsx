"use client";

import { useEffect, useState } from "react";
import type {
  GeneratedQuestion,
  QuestionAnswerWithTags,
} from "@/lib/types/questions";

const EMPTY_ANSWERS: QuestionAnswerWithTags[] = [];

interface QuestionAnswerFormProps {
  questionSetId: number;
  questions: GeneratedQuestion[];
  initialAnswers?: QuestionAnswerWithTags[];
  onSave: (answers: QuestionAnswerWithTags[]) => void;
  onCancel: () => void;
}

export function QuestionAnswerForm({
  questionSetId,
  questions,
  initialAnswers = EMPTY_ANSWERS,
  onSave,
  onCancel,
}: QuestionAnswerFormProps) {
  const [answers, setAnswers] = useState<QuestionAnswerWithTags[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});

  // Only reset when switching to a different question set — not on every parent re-render
  useEffect(() => {
    setAnswers(initialAnswers);
    const noteMap: Record<string, string> = {};
    for (const a of initialAnswers) {
      if (a.note) noteMap[a.question] = a.note;
    }
    setNotes(noteMap);
  }, [questionSetId]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectOption = (
    question: string,
    answer: string,
    tags: string[]
  ) => {
    setAnswers((prev) => {
      const idx = prev.findIndex((a) => a.question === question);
      const entry: QuestionAnswerWithTags = {
        question,
        answer,
        tags,
      };
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...entry, note: next[idx].note };
        return next;
      }
      return [...prev, entry].sort((a, b) => {
        const ai = questions.findIndex((q) => q.text === a.question);
        const bi = questions.findIndex((q) => q.text === b.question);
        return ai - bi;
      });
    });
  };

  const handleSave = () => {
    const final = questions
      .map((q) => {
        const found = answers.find((a) => a.question === q.text);
        if (!found?.answer) return null;
        return {
          ...found,
          note: notes[q.text]?.trim() || found.note,
        };
      })
      .filter(Boolean) as QuestionAnswerWithTags[];

    if (final.length < questions.length) {
      alert(`Please answer all ${questions.length} questions before saving.`);
      return;
    }
    onSave(final);
  };

  const answeredCount = questions.filter((q) =>
    answers.some((a) => a.question === q.text && a.answer)
  ).length;

  if (!questions.length) {
    return (
      <p className="text-sm text-zinc-500">No questions to answer.</p>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h3 className="text-sm font-semibold">
            Answer questions ({answeredCount}/{questions.length})
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
          {questions.map((q, i) => {
            const selected = answers.find((a) => a.question === q.text);
            return (
              <div
                key={`${questionSetId}-${q.questionId}`}
                className="rounded-md border border-zinc-100 p-3 dark:border-zinc-800"
              >
                <p className="mb-2 text-sm font-medium">
                  {i + 1}. {q.text}
                </p>
                {q.options.length === 0 ? (
                  <p className="text-xs text-red-500">No options in this question.</p>
                ) : (
                  <div className="space-y-1.5">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selected?.answer === opt.text;
                      return (
                        <button
                          key={`${q.questionId}-${optIdx}`}
                          type="button"
                          onClick={() =>
                            selectOption(q.text, opt.text, opt.tags)
                          }
                          className={`w-full rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                            isSelected
                              ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                              : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-800"
                          }`}
                        >
                          {opt.text}
                          {opt.tags.length > 0 && (
                            <span
                              className={
                                isSelected
                                  ? "ml-1 opacity-70"
                                  : "ml-1 text-zinc-400"
                              }
                            >
                              [{opt.tags.join(", ")}]
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Optional note…"
                  value={notes[q.text] ?? ""}
                  onChange={(e) =>
                    setNotes((prev) => ({ ...prev, [q.text]: e.target.value }))
                  }
                  className="mt-2 w-full rounded border border-zinc-200 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>
            );
          })}
        </div>

        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Save answers
          </button>
        </div>
      </div>
    </div>
  );
}
