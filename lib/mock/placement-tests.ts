import type { User } from "@/types";

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

export const PLACEMENT_SKILL_TYPES = [
  "grammar",
  "vocab",
  "reading",
  "listening",
] as const;
export type PlacementSkillType = (typeof PLACEMENT_SKILL_TYPES)[number];

export const PLACEMENT_QUESTION_TYPES = ["mcq", "true_false", "fill_blank"] as const;
export type PlacementQuestionType = (typeof PLACEMENT_QUESTION_TYPES)[number];

export type PlacementQuestion = {
  id: string;
  prompt: string;
  instruction: string;
  passage: string;
  type: PlacementQuestionType;
  options: string[];
  correctOptionIndex: number;
  skillType: PlacementSkillType;
  targetLevel: CefrLevel;
  weight: number;
  explanation: string;
  isActive: boolean;
};

export type PlacementLevelRule = {
  id: string;
  level: CefrLevel;
  minScore: number;
  maxScore: number;
};

export type PlacementTest = {
  id: string;
  title: string;
  description: string;
  instructions: string;
  durationMinutes: number;
  isActive: boolean;
  questions: PlacementQuestion[];
  levelRules: PlacementLevelRule[];
  createdAt: string;
  updatedAt: string;
};

export type OnboardingProfileDraft = {
  selectedLanguage: string;
  selectedLevel: string;
  weeklyHours: number;
  displayName: string;
  jobTitle: string;
  selectedGoals: string[];
  startedAt: string;
};

export type PlacementAnswerResult = {
  questionId: string;
  selectedOptionIndex: number | null;
  isCorrect: boolean;
  earnedScore: number;
};

export type PlacementSkillBreakdown = {
  skillType: PlacementSkillType;
  earnedScore: number;
  maxScore: number;
  percent: number;
};

export type PlacementResult = {
  testId: string | null;
  testTitle: string;
  rawScore: number;
  maxScore: number;
  percent: number;
  detectedLevel: CefrLevel;
  confirmedLevel: CefrLevel | null;
  skipped: boolean;
  answers: PlacementAnswerResult[];
  skillBreakdown: PlacementSkillBreakdown[];
  completedAt: string;
};

const PLACEMENT_TESTS_STORAGE_KEY = "mock_admin_placement_tests";
const ONBOARDING_PROFILE_STORAGE_KEY = "mock_onboarding_profile";
const PLACEMENT_RESULT_STORAGE_KEY = "mock_placement_result";

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getNow = () => new Date().toISOString();

const LEVEL_LABELS: Record<CefrLevel, string> = {
  A1: "A1",
  A2: "A2",
  B1: "B1",
  B2: "B2",
  C1: "C1",
  C2: "C2",
};

const DEFAULT_PLACEMENT_TESTS: PlacementTest[] = [
  {
    id: "placement-test-starter",
    title: "Starter Placement Test",
    description:
      "Bài test đầu vào mock để xác định nhanh level của người học mới trước khi vào lộ trình.",
    instructions:
      "Chọn đáp án đúng nhất cho từng câu. Kết quả là gợi ý khách quan từ hệ thống, bạn vẫn có thể xác nhận học ở level thấp hơn sau khi xem kết quả.",
    durationMinutes: 10,
    isActive: true,
    questions: [
      {
        id: "pt-q1",
        prompt: "Choose the correct sentence.",
        instruction: "",
        passage: "",
        type: "mcq",
        options: ["I am a student.", "I is a student.", "I are a student.", "I be a student."],
        correctOptionIndex: 0,
        skillType: "grammar",
        targetLevel: "A1",
        weight: 1,
        explanation: "Sau chủ ngữ 'I' dùng động từ 'am'.",
        isActive: true,
      },
      {
        id: "pt-q2",
        prompt: "What is the best answer to: 'How often do you go to the gym?'",
        instruction: "",
        passage: "",
        type: "mcq",
        options: ["Twice a week.", "In the morning yesterday.", "Because it is near.", "At the station."],
        correctOptionIndex: 0,
        skillType: "reading",
        targetLevel: "A2",
        weight: 1,
        explanation: "Câu hỏi về tần suất nên trả lời bằng số lần trong một khoảng thời gian.",
        isActive: true,
      },
      {
        id: "pt-q3",
        prompt: "Pick the word closest in meaning to 'begin'.",
        instruction: "",
        passage: "",
        type: "mcq",
        options: ["Start", "Finish", "Delay", "Stop"],
        correctOptionIndex: 0,
        skillType: "vocab",
        targetLevel: "A2",
        weight: 1,
        explanation: "'Begin' gần nghĩa nhất với 'start'.",
        isActive: true,
      },
      {
        id: "pt-q4",
        prompt: "Choose the correct sentence.",
        instruction: "",
        passage: "",
        type: "mcq",
        options: [
          "If it rains, we will stay inside.",
          "If it will rain, we stay inside.",
          "If it rains, we stayed inside.",
          "If it rain, we will stays inside.",
        ],
        correctOptionIndex: 0,
        skillType: "grammar",
        targetLevel: "B1",
        weight: 1,
        explanation: "First conditional dùng hiện tại đơn ở mệnh đề if, và will + V ở mệnh đề chính.",
        isActive: true,
      },
      {
        id: "pt-q5",
        prompt: "Choose the best transition to complete the sentence.",
        instruction: "She had prepared carefully; ___, the presentation went smoothly.",
        passage: "",
        type: "mcq",
        options: ["therefore", "unless", "meanwhile", "although"],
        correctOptionIndex: 0,
        skillType: "vocab",
        targetLevel: "B1",
        weight: 1,
        explanation: "'Therefore' thể hiện quan hệ nguyên nhân - kết quả.",
        isActive: true,
      },
      {
        id: "pt-q6",
        prompt: "Choose the sentence that sounds most natural in a work email.",
        instruction: "",
        passage: "",
        type: "mcq",
        options: [
          "Could you please share the updated file by Friday?",
          "Send me the file Friday.",
          "You should giving me that file Friday.",
          "Where the file is for Friday?",
        ],
        correctOptionIndex: 0,
        skillType: "reading",
        targetLevel: "B2",
        weight: 1,
        explanation: "Đây là cách diễn đạt lịch sự và tự nhiên trong ngữ cảnh công việc.",
        isActive: true,
      },
      {
        id: "pt-q7",
        prompt: "Complete the sentence with the most accurate option.",
        instruction: "By the time the meeting started, the team ___ the proposal twice.",
        passage: "",
        type: "mcq",
        options: ["had reviewed", "reviewed", "has reviewed", "was reviewing"],
        correctOptionIndex: 0,
        skillType: "grammar",
        targetLevel: "C1",
        weight: 1,
        explanation: "Past perfect diễn tả hành động xảy ra trước một mốc quá khứ khác.",
        isActive: true,
      },
      {
        id: "pt-q8",
        prompt: "Choose the most precise meaning of 'feasible'.",
        instruction: "",
        passage: "",
        type: "mcq",
        options: ["Possible and practical", "Very expensive", "Risky but exciting", "Already completed"],
        correctOptionIndex: 0,
        skillType: "vocab",
        targetLevel: "C1",
        weight: 1,
        explanation: "'Feasible' nghĩa là khả thi cả về mặt thực hiện lẫn điều kiện thực tế.",
        isActive: true,
      },
    ],
    levelRules: [
      { id: "rule-a1", level: "A1", minScore: 0, maxScore: 1 },
      { id: "rule-a2", level: "A2", minScore: 2, maxScore: 3 },
      { id: "rule-b1", level: "B1", minScore: 4, maxScore: 5 },
      { id: "rule-b2", level: "B2", minScore: 6, maxScore: 6 },
      { id: "rule-c1", level: "C1", minScore: 7, maxScore: 7 },
      { id: "rule-c2", level: "C2", minScore: 8, maxScore: 8 },
    ],
    createdAt: "2026-03-29T00:00:00.000Z",
    updatedAt: "2026-03-29T00:00:00.000Z",
  },
];

function isBrowser() {
  return typeof window !== "undefined";
}

function normalizeSingleActive(tests: PlacementTest[]) {
  let activeFound = false;

  return tests.map((item) => {
    if (!item.isActive) {
      return item;
    }

    if (!activeFound) {
      activeFound = true;
      return item;
    }

    return {
      ...item,
      isActive: false,
    };
  });
}

function sortTests(tests: PlacementTest[]) {
  return [...tests].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

function persistPlacementTests(tests: PlacementTest[]) {
  const normalized = sortTests(normalizeSingleActive(tests));

  if (isBrowser()) {
    window.localStorage.setItem(PLACEMENT_TESTS_STORAGE_KEY, JSON.stringify(normalized));
  }

  return normalized;
}

export function createEmptyPlacementQuestion(): PlacementQuestion {
  return {
    id: createId("placement-question"),
    prompt: "",
    instruction: "",
    passage: "",
    type: "mcq",
    options: ["", ""],
    correctOptionIndex: 0,
    skillType: "grammar",
    targetLevel: "A1",
    weight: 1,
    explanation: "",
    isActive: true,
  };
}

export function createEmptyPlacementLevelRule(level: CefrLevel = "A1"): PlacementLevelRule {
  return {
    id: createId("placement-rule"),
    level,
    minScore: 0,
    maxScore: 0,
  };
}

export function createEmptyPlacementTest(): PlacementTest {
  const now = getNow();

  return {
    id: createId("placement-test"),
    title: "",
    description: "",
    instructions: "",
    durationMinutes: 10,
    isActive: false,
    questions: [createEmptyPlacementQuestion()],
    levelRules: CEFR_LEVELS.map((level) => createEmptyPlacementLevelRule(level)),
    createdAt: now,
    updatedAt: now,
  };
}

export function loadPlacementTests() {
  if (!isBrowser()) {
    return clone(DEFAULT_PLACEMENT_TESTS);
  }

  const raw = window.localStorage.getItem(PLACEMENT_TESTS_STORAGE_KEY);

  if (!raw) {
    return persistPlacementTests(clone(DEFAULT_PLACEMENT_TESTS));
  }

  try {
    const parsed = JSON.parse(raw) as PlacementTest[];

    if (!Array.isArray(parsed)) {
      return persistPlacementTests(clone(DEFAULT_PLACEMENT_TESTS));
    }

    return persistPlacementTests(parsed);
  } catch {
    return persistPlacementTests(clone(DEFAULT_PLACEMENT_TESTS));
  }
}

export function getPlacementTestById(id: string) {
  return loadPlacementTests().find((item) => item.id === id) ?? null;
}

export function upsertPlacementTest(test: PlacementTest) {
  const now = getNow();
  const current = loadPlacementTests();
  const existing = current.find((item) => item.id === test.id);

  const nextItem: PlacementTest = {
    ...test,
    createdAt: existing?.createdAt || test.createdAt || now,
    updatedAt: now,
  };

  const next = existing
    ? current.map((item) => (item.id === nextItem.id ? nextItem : item))
    : [nextItem, ...current];

  return persistPlacementTests(
    nextItem.isActive
      ? next.map((item) => ({
          ...item,
          isActive: item.id === nextItem.id,
        }))
      : next
  );
}

export function deletePlacementTestById(id: string) {
  return persistPlacementTests(loadPlacementTests().filter((item) => item.id !== id));
}

export function activatePlacementTest(id: string) {
  return persistPlacementTests(
    loadPlacementTests().map((item) => ({
      ...item,
      isActive: item.id === id,
      updatedAt: item.id === id ? getNow() : item.updatedAt,
    }))
  );
}

export function getActivePlacementTest() {
  return loadPlacementTests().find((item) => item.isActive) ?? null;
}

export function calculatePlacementMaxScore(test: PlacementTest) {
  return test.questions
    .filter((question) => question.isActive)
    .reduce((total, question) => total + Math.max(1, Number(question.weight) || 1), 0);
}

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
  return LEVEL_LABELS[level] || level;
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

export function saveOnboardingProfileDraft(profile: OnboardingProfileDraft) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(ONBOARDING_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function loadOnboardingProfileDraft(): OnboardingProfileDraft | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(ONBOARDING_PROFILE_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as OnboardingProfileDraft;
  } catch {
    window.localStorage.removeItem(ONBOARDING_PROFILE_STORAGE_KEY);
    return null;
  }
}

export function savePlacementResult(result: PlacementResult) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(PLACEMENT_RESULT_STORAGE_KEY, JSON.stringify(result));
}

export function loadPlacementResult(): PlacementResult | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(PLACEMENT_RESULT_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PlacementResult;
  } catch {
    window.localStorage.removeItem(PLACEMENT_RESULT_STORAGE_KEY);
    return null;
  }
}

export function scorePlacementTest(
  test: PlacementTest,
  answersByQuestionId: Record<string, number>
): PlacementResult {
  const activeQuestions = test.questions.filter((question) => question.isActive);
  const skillSummary = new Map<
    PlacementSkillType,
    {
      earnedScore: number;
      maxScore: number;
    }
  >();

  PLACEMENT_SKILL_TYPES.forEach((skill) => {
    skillSummary.set(skill, { earnedScore: 0, maxScore: 0 });
  });

  const answers = activeQuestions.map((question) => {
    const selectedOptionIndex = Number.isInteger(answersByQuestionId[question.id])
      ? answersByQuestionId[question.id]
      : null;
    const isCorrect = selectedOptionIndex === question.correctOptionIndex;
    const earnedScore = isCorrect ? Math.max(1, Number(question.weight) || 1) : 0;
    const skillBucket = skillSummary.get(question.skillType);

    if (skillBucket) {
      skillBucket.maxScore += Math.max(1, Number(question.weight) || 1);
      skillBucket.earnedScore += earnedScore;
    }

    return {
      questionId: question.id,
      selectedOptionIndex,
      isCorrect,
      earnedScore,
    };
  });

  const rawScore = answers.reduce((total, answer) => total + answer.earnedScore, 0);
  const maxScore = calculatePlacementMaxScore(test);
  const percent = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0;

  const sortedRules = [...test.levelRules].sort((a, b) => a.minScore - b.minScore);
  const matchedRule =
    sortedRules.find((rule) => rawScore >= rule.minScore && rawScore <= rule.maxScore) ||
    sortedRules[sortedRules.length - 1] ||
    { level: "A1" as CefrLevel };

  return {
    testId: test.id,
    testTitle: test.title,
    rawScore,
    maxScore,
    percent,
    detectedLevel: matchedRule.level,
    confirmedLevel: null,
    skipped: false,
    answers,
    skillBreakdown: PLACEMENT_SKILL_TYPES.map((skill) => {
      const bucket = skillSummary.get(skill) || { earnedScore: 0, maxScore: 0 };

      return {
        skillType: skill,
        earnedScore: bucket.earnedScore,
        maxScore: bucket.maxScore,
        percent: bucket.maxScore > 0 ? Math.round((bucket.earnedScore / bucket.maxScore) * 100) : 0,
      };
    }),
    completedAt: getNow(),
  };
}

export function createSkippedPlacementResult(test: PlacementTest | null = null): PlacementResult {
  return {
    testId: test?.id || null,
    testTitle: test?.title || "Skipped placement test",
    rawScore: 0,
    maxScore: test ? calculatePlacementMaxScore(test) : 0,
    percent: 0,
    detectedLevel: "A1",
    confirmedLevel: "A1",
    skipped: true,
    answers: [],
    skillBreakdown: PLACEMENT_SKILL_TYPES.map((skill) => ({
      skillType: skill,
      earnedScore: 0,
      maxScore: 0,
      percent: 0,
    })),
    completedAt: getNow(),
  };
}

export function buildOnboardingCompletedUser(
  user: User,
  options: {
    level: CefrLevel;
    placementScore: number;
    displayName?: string;
  }
): User {
  const nextFullName = options.displayName?.trim() || user.fullName || user.name || "";

  return {
    ...user,
    fullName: nextFullName,
    name: nextFullName,
    currentLevel: options.level,
    onboardingDone: true,
    placementScore: options.placementScore,
  };
}
