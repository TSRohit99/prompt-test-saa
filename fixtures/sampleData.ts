import type { Belief, MindScanAnswer, MindScanRecord, ShadowAnswer } from "@/lib/types";

export const SAMPLE_PREVIOUS_EXPERIENCE =
  "No matter how much I try, money still never stays with me.";

export const SAMPLE_PREVIOUS_BELIEFS: Belief[] = [
  {
    belief: "If money comes, something will take it away.",
    intensity: 7,
    category: "Money & Abundance Beliefs",
    improvement: { percentage: 0, originalIntensity: 7 },
  },
  {
    belief: "I have to prove myself before I can receive more.",
    intensity: 5,
    category: "Self Confidence & Self-Worth",
    improvement: { percentage: 0, originalIntensity: 5 },
  },
];

export const SAMPLE_ANSWERS: MindScanAnswer[] = [
  {
    question: "When you think about money, what pattern keeps repeating?",
    answer: "I earn okay but it disappears before I feel safe.",
    note: "This has been true for years.",
  },
  {
    question: "What happens in your body when money pressure rises?",
    answer: "My chest tightens and I start scanning for what could go wrong.",
  },
  {
    question: "What feeling appears first around money?",
    answer: "A quiet fear that it won't last.",
  },
  {
    question: "Which inner sentence sounds most like you?",
    answer: "If I relax, something will take it away.",
  },
  {
    question: "What do you tend to do to avoid money pain?",
    answer: "I overwork and avoid checking my accounts.",
  },
  {
    question: "Does this feeling seem new or familiar?",
    answer: "Familiar — like an old alarm.",
  },
];

export const SAMPLE_TAGS = [
  { id: "1", text: "mistrust" },
  { id: "2", text: "scarcity" },
];

export const SAMPLE_MIRROR_RESULT = [
  {
    section: "pattern",
    patternName: "The Watchful Receiver",
    patternDescription:
      "A part of you wants more security, but another part stays alert when something good appears.",
    currentFocus: "Receiving without preparing for loss",
    recommendedExercise: "Guided Meditation",
  },
  {
    section: "reflection",
    content:
      "Your answers may suggest that receiving still feels risky, even when things are going okay.",
  },
  {
    section: "protection",
    content:
      "This pattern may be trying to protect you from the shock of losing what you finally gained.",
  },
  {
    section: "change",
    content:
      "With practice, your body can learn that receiving does not always lead to loss. Guided Meditation may help.",
  },
  {
    section: "closingQuestion",
    content: "What would it feel like to receive without bracing for the fall?",
  },
];

export const SAMPLE_MINDSCAN: Omit<MindScanRecord, "id" | "scanId" | "createdAt"> = {
  categories: ["Money & Abundance Beliefs"],
  tags: SAMPLE_TAGS,
  identifiedBeliefs: SAMPLE_PREVIOUS_BELIEFS,
  mirrorResult: SAMPLE_MIRROR_RESULT,
  mindScanAnswers: SAMPLE_ANSWERS,
  previousExperience: SAMPLE_PREVIOUS_EXPERIENCE,
};

export const SAMPLE_SHADOW_ANSWERS: ShadowAnswer[] = [
  {
    questionIndex: 0,
    question: "What quality in others irritates you most?",
    answer: "People who spend freely without worrying.",
  },
  {
    questionIndex: 1,
    question: "What do you secretly envy?",
    answer: "People who can relax when money is good.",
  },
  {
    questionIndex: 2,
    question: "What kind of person do you fear becoming?",
    answer: "Someone careless who loses everything.",
  },
  {
    questionIndex: 3,
    question: "What does the silenced part of you want?",
    answer: "To enjoy what I have without guilt.",
  },
  {
    questionIndex: 4,
    question: "If this hidden part could speak, what would it say?",
    answer: "Stop treating every good moment like a trap.",
  },
];
