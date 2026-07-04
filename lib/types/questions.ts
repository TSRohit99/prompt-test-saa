import type { Belief } from "@/lib/types";

export interface QuestionOption {
  text: string;
  tags: string[];
}

export interface GeneratedQuestion {
  questionId: string;
  text: string;
  options: QuestionOption[];
}

export interface QuestionAnswerWithTags {
  question: string;
  answer: string;
  tags: string[];
  note?: string;
}

export interface QuestionSetRecord {
  id?: number;
  category: string;
  categories: string[];
  previousExperience: string;
  previousBeliefs: Belief[];
  questions: GeneratedQuestion[];
  answers?: QuestionAnswerWithTags[];
  tags?: Array<{ id: string; text: string }>;
  status: "generated" | "answered";
  createdAt: number;
  answeredAt?: number;
}
