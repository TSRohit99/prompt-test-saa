export type ShadowQuestion = {
  text: string;
  suggestions: string[];
};

export const MINDSCAN_CATEGORY = {
  MONEY: "Money & Abundance Beliefs",
  CONFIDENCE: "Self Confidence & Self-Worth",
  RELATIONSHIPS: "Relationships & Attachment Styles",
  LOST_EXCITEMENT: "Lost Excitement Or Traumatic Experiences",
} as const;

export type MindScanCategory =
  (typeof MINDSCAN_CATEGORY)[keyof typeof MINDSCAN_CATEGORY];

export const SHADOW_QUESTIONS_BY_CATEGORY: Record<
  MindScanCategory,
  ShadowQuestion[]
> = {
  [MINDSCAN_CATEGORY.MONEY]: [
    {
      text: "When you watch certain people around money, do you notice an uncomfortable feeling rising inside you — stronger than it probably needs to be? What kind of people bring that feeling up?",
      suggestions: [
        "People who spend freely",
        "People who talk about money without hesitation",
        "People who ask for more without apologizing",
      ],
    },
    {
      text: 'If you\'re honest with yourself, is there something you see in others around money that quietly makes you think "I wish I had that too"?',
      suggestions: [
        "Ease",
        "A sense of security",
        "Being able to receive support",
      ],
    },
    {
      text: "Is there something you actually want around money but can't quite let yourself want it?",
      suggestions: ["More", "More comfort", "More freedom"],
    },
    {
      text: "Imagine you openly admitted what you really want around money. What kind of person would you be afraid of becoming?",
      suggestions: ["Selfish", "Greedy", "Someone who lost their values"],
    },
    {
      text: "If there's a part of you that's been quiet around money for a long time — what would it want to say to you today?",
      suggestions: ["Wanting", "Receiving", "Resting"],
    },
  ],
  [MINDSCAN_CATEGORY.CONFIDENCE]: [
    {
      text: "When certain people step forward, speak up, or put themselves out there — does something uncomfortable stir inside you? What do they do that triggers it most?",
      suggestions: [
        "Being confident",
        "Being visible",
        "Not hiding their success",
      ],
    },
    {
      text: "If you're honest, what kind of confidence do you see in others and quietly wish you had?",
      suggestions: [
        "Speaking without holding back",
        "Trying things without overthinking",
        "Not hiding who they are",
      ],
    },
    {
      text: "Is there something about yourself that you actually want — but wanting it feels like too much, inappropriate, or ego?",
      suggestions: [
        "Being seen",
        "Being appreciated",
        "Having your success noticed",
      ],
    },
    {
      text: "Imagine you let yourself show up more. What kind of person would you be afraid of becoming?",
      suggestions: ["Arrogant", "Too much", "Someone people criticize"],
    },
    {
      text: "If there's a confident part of you that's been quiet for a long time — what would it want to say to you today?",
      suggestions: ["Being visible", "Trying", "Taking up space"],
    },
  ],
  [MINDSCAN_CATEGORY.RELATIONSHIPS]: [
    {
      text: "Does the way some people ask for love, attention, or affection in relationships make you uncomfortable? What do they do that tends to trigger something in you?",
      suggestions: [
        "Asking for attention",
        "Wanting to hear they're loved",
        "Showing their feelings openly",
      ],
    },
    {
      text: "If you're honest, is there something you see in others around relationships that you quietly wish you had?",
      suggestions: [
        "Receiving love easily",
        "Being able to say what they need",
        "Feeling chosen",
      ],
    },
    {
      text: "Is there something you actually want in relationships but letting yourself want it feels weak, needy, or too much?",
      suggestions: [
        "More closeness",
        "More attention",
        "A clearer sense of security",
      ],
    },
    {
      text: "Imagine you said exactly what you wanted in a relationship. What kind of person would you be afraid of becoming?",
      suggestions: ["Needy", "Weak", "Too demanding"],
    },
    {
      text: "If there's a part of you that's been quiet around relationships for a long time — what would it want to say to you today?",
      suggestions: ["Closeness", "Need", "Being chosen"],
    },
  ],
  [MINDSCAN_CATEGORY.LOST_EXCITEMENT]: [
    {
      text: "When you see people who seem relaxed, alive, or genuinely enjoying themselves — does something in you pull back, feel distant, or go quiet? What do they do that feels furthest from where you are?",
      suggestions: [
        "Being at ease",
        "Enjoying things",
        "Looking like they feel safe",
      ],
    },
    {
      text: 'If you\'re honest, is there something you see in others and quietly think "I wish I could feel that way"?',
      suggestions: [
        "Aliveness",
        "Lightness",
        "Feeling safe in their body",
      ],
    },
    {
      text: "Is there a part of you that wants to want things again, feel pleasure, or just let go a little — but finds it hard?",
      suggestions: ["Joy", "Rest", "Slowly coming back"],
    },
    {
      text: "Imagine you let yourself relax, enjoy something, or feel alive again. What kind of person would you be afraid of becoming?",
      suggestions: ["Vulnerable", "Unprepared", "Too soft"],
    },
    {
      text: "If there's a part of you that's been quiet for a long time — what would it want to say to you today?",
      suggestions: ["Breath", "Aliveness", "Trust"],
    },
  ],
};

export const SHADOW_ANSWER_MAX_LENGTH = 600;

export function getShadowQuestionsForCategory(
  category: string | null | undefined
): ShadowQuestion[] | null {
  if (!category) return null;
  return SHADOW_QUESTIONS_BY_CATEGORY[category as MindScanCategory] ?? null;
}

export function buildShadowAnswersFromTexts(
  questions: ShadowQuestion[],
  answerTexts: string[]
): { questionIndex: number; question: string; answer: string }[] {
  return questions.map((q, index) => ({
    questionIndex: index,
    question: q.text,
    answer: answerTexts[index]?.trim() ?? "",
  }));
}
