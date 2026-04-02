import type {
  AdminPlacementQuestionItem,
  CefrLevel,
  PlacementSkillType,
} from "@/types";

export const CEFR_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function getLevelIndex(level: CefrLevel) {
  return CEFR_LEVELS.indexOf(level);
}

export function getLevelsAtOrBelow(level: CefrLevel) {
  const index = getLevelIndex(level);

  if (index < 0) {
    return ["A1"] as CefrLevel[];
  }

  return [...CEFR_LEVELS.slice(0, index + 1)].reverse();
}

export function formatLevelLabel(level: CefrLevel) {
  return level;
}

export function formatSkillLabel(skill: PlacementSkillType) {
  switch (skill) {
    case "grammar":
      return "Grammar";
    case "vocab":
      return "Vocabulary";
    case "reading":
      return "Reading";
    case "listening":
      return "Listening";
    default:
      return skill;
  }
}

export function calculatePlacementMaxScore(
  questions: Pick<AdminPlacementQuestionItem, "isActive" | "weight">[]
) {
  return questions
    .filter((question) => question.isActive)
    .reduce((total, question) => total + Math.max(1, Number(question.weight) || 1), 0);
}
