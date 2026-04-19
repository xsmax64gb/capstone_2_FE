import type {
  AdminPlacementQuestionItem,
  CefrLevel,
  AdminPlacementLevelRuleItem,
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

export function getLevelsInRange(levelFrom: CefrLevel, levelTo: CefrLevel) {
  const fromIndex = getLevelIndex(levelFrom);
  const toIndex = getLevelIndex(levelTo);
  const start = Math.min(fromIndex, toIndex);
  const end = Math.max(fromIndex, toIndex);
  return CEFR_LEVELS.slice(start, end + 1);
}

export function buildPlacementLevelRules(
  questions: Pick<AdminPlacementQuestionItem, "isActive" | "weight">[],
  levelFrom: CefrLevel,
  levelTo: CefrLevel
): AdminPlacementLevelRuleItem[] {
  const levels = getLevelsInRange(levelFrom, levelTo);
  const maxScore = calculatePlacementMaxScore(questions);
  const step = Math.max(1, Math.floor((maxScore + 1) / levels.length));

  return levels.map((level, index) => {
    const minScore = index === 0 ? 0 : index * step;
    const maxScoreForLevel =
      index === levels.length - 1 ? maxScore : Math.min(maxScore, (index + 1) * step - 1);
    return {
      id: `placement-rule-${level}-${index}-${maxScore}`,
      level,
      minScore,
      maxScore: Math.max(minScore, maxScoreForLevel),
    };
  });
}
