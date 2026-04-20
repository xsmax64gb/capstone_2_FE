import { API_BASE_URL } from "@/config/api";
import { tokenManager } from "./token-manager";

export interface LevelInfo {
  currentLevel: number;
  currentLevelName: string;
  totalXp: number;
  currentLevelThreshold: number;
  nextLevelThreshold: number;
  xpToNextLevel: number;
  progressPercentage: number;
  testAvailable: boolean;
  canAttemptTest: boolean;
}

export interface LevelHistoryItem {
  level: number;
  levelName: string;
  unlockMethod: "test_passed" | "auto_advanced";
  testScore: number | null;
  unlockedAt: string;
}

export interface LevelHistoryResponse {
  history: LevelHistoryItem[];
  statistics: {
    currentLevel: number;
    levelsCompleted: number;
    testsPassed: number;
    testsFailed: number;
    averageTestScore: number;
  };
}

export interface TestAvailability {
  hasTest: boolean;
  testCount: number;
  targetLevel: number;
  canAttempt: boolean;
  cooldownRemaining: number | null;
  xpNeededForRetry: number | null;
}

export interface TestSection {
  sectionName: string;
  weight: number;
  questions: TestQuestion[];
}

export interface TestQuestion {
  questionText: string;
  questionType: "mcq" | "fill_blank" | "matching";
  options?: Array<{ text: string }>;
  pairs?: Array<{ left: string; right: string }>;
  points: number;
}

export interface TestAttempt {
  attemptId: string;
  testId: string;
  testName: string;
  level: number;
  sections: TestSection[];
  timeLimit: number;
  passThreshold: number;
  startedAt: string;
}

export interface TestAnswer {
  sectionIndex: number;
  questionIndex: number;
  userAnswer: any;
}

export interface SectionScore {
  sectionName: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface TestResult {
  attemptId: string;
  totalScore: number;
  sectionScores: SectionScore[];
  passed: boolean;
  passThreshold: number;
  levelAdvanced: boolean;
  newLevel: number | null;
  timeSpent: number;
  nextSteps: {
    canRetry: boolean;
    cooldownEndsAt: string | null;
    xpNeededForRetry: number | null;
  };
}

const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const normalizedBase = API_BASE_URL.trim();

  if (!normalizedBase) {
    return normalizedPath;
  }

  if (/^https?:\/\//i.test(normalizedBase)) {
    return `${normalizedBase.replace(/\/$/, "")}${normalizedPath}`;
  }

  const prefixedBase = normalizedBase.startsWith("/")
    ? normalizedBase
    : `/${normalizedBase}`;

  return `${prefixedBase.replace(/\/$/, "")}${normalizedPath}`;
};

const getAuthHeaders = () => {
  const token = tokenManager.getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const levelApi = {
  async getUserLevel(): Promise<LevelInfo> {
    const response = await fetch(buildApiUrl("/user/level"), {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user level: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  },

  async getLevelHistory(): Promise<LevelHistoryResponse> {
    const response = await fetch(buildApiUrl("/user/level-history"), {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch level history: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data.data;
  },

  async getTestAvailability(): Promise<TestAvailability> {
    const response = await fetch(buildApiUrl("/level-test/available"), {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch test availability: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data.data;
  },

  async startTest(level: number): Promise<TestAttempt> {
    const response = await fetch(buildApiUrl("/level-test/start"), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ level }),
    });

    if (!response.ok) {
      throw new Error(`Failed to start test: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  },

  async submitTest(
    attemptId: string,
    answers: TestAnswer[],
  ): Promise<TestResult> {
    const response = await fetch(buildApiUrl("/level-test/submit"), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ attemptId, answers }),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit test: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  },
};
