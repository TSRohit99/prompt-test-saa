import type { MindScanCategory } from "@/lib/types";
import { generateQuestionsPromptsMA } from "./questions/moneyAbundancePrompts";
import { generateQuestionsPromptsRA } from "./questions/relationshipAttachmentPrompts";
import { generateQuestionsPromptsSS } from "./questions/selfConfidencePrompts";
import { generateQuestionsPromptsLETE } from "./questions/tramuticExperiencePrompts";

export function getQuestionsPrompts(
  category: MindScanCategory,
  previousExperience: string,
  previousBeliefsStr: string
) {
  switch (category) {
    case "Money & Abundance Beliefs":
      return generateQuestionsPromptsMA(previousExperience, previousBeliefsStr);
    case "Self Confidence & Self-Worth":
      return generateQuestionsPromptsSS(previousExperience, previousBeliefsStr);
    case "Relationships & Attachment Styles":
      return generateQuestionsPromptsRA(previousExperience, previousBeliefsStr);
    case "Lost Excitement Or Traumatic Experiences":
      return generateQuestionsPromptsLETE(
        previousExperience,
        previousBeliefsStr
      );
    default:
      return generateQuestionsPromptsMA(previousExperience, previousBeliefsStr);
  }
}

export {
  createResponsePrompts,
} from "./chat/createResponsePrompts";
export { createSummaryPrompts } from "./chat/createSummaryPrompts";
export { beliefDetectorPrompts } from "./analyze/beliefDetector";
export { mirrorResultPrompts } from "./analyze/mirrorResult";
export { shadowAnalysisPrompts } from "./shadow/shadowAnalysisPrompts";
