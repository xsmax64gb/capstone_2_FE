// Auth Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  name?: string;
  bio?: string;
  nativeLanguage?: string;
  timezone?: string;
  role?: string;
  currentLevel?: string;
  exp?: number;
  onboardingDone?: boolean;
  placementScore?: number;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  otp: string;
}

export interface SendOtpRequest {
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface ChangePasswordRequest {
  email: string;
  newPassword: string;
  otp: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  bio?: string;
  nativeLanguage?: string;
  timezone?: string;
  avatarFile?: File | null;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Notification Types
export type NotificationType =
  | "default"
  | "success"
  | "error"
  | "warning"
  | "info";

export interface Notification {
  id: string;
  title: string;
  message?: string;
  type: NotificationType;
  duration?: number;
}

export interface MetricBreakdownItem {
  count: number;
  level?: string;
  role?: string;
  status?: string;
  type?: string;
}

export interface AdminOverviewResponse {
  summary: {
    totalUsers: number;
    onboardingCompleted: number;
    onboardingPending: number;
    adminUsers: number;
    totalAttempts: number;
    attemptsLast7Days: number;
    activeAiSessions: number;
    totalContentItems: number;
  };
  systemSnapshot: {
    uptime: number;
    status: string;
    apiTimestamp: string;
    totals: {
      exercises: number;
      vocabularies: number;
    };
  };
  recentActivity: Array<{
    type: string;
    title: string;
    detail: string;
    timestamp: string | null;
  }>;
}

export interface AdminUsersResponse {
  summary: {
    totalUsers: number;
    onboardingCompleted: number;
    onboardingPending: number;
    adminUsers: number;
    averagePlacementScore: number;
  };
  breakdowns: {
    byLevel: MetricBreakdownItem[];
    byRole: MetricBreakdownItem[];
  };
  users: User[];
}

export interface AdminExerciseItem {
  id: string;
  title: string;
  description: string;
  level: string;
  type: string;
  topic: string;
  questionCount: number;
  durationMinutes: number;
  rewardsXp: number;
  coverImage: string;
  skills: string[];
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AdminVocabularyWordItem {
  id: string;
  setId: string;
  word: string;
  meaning: string;
  example: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AdminVocabularySetItem {
  id: string;
  name: string;
  description: string;
  level: string;
  topic: string;
  coverImageUrl: string;
  isActive: boolean;
  sortOrder: number;
  wordCount: number;
  words: AdminVocabularyWordItem[];
  createdAt: string | null;
  updatedAt: string | null;
}

export type AdminVocabularyItem = AdminVocabularySetItem;

export interface AdminAiStage {
  stageId: string;
  name: string;
  order: number;
  type: string;
  context: string;
  aiRole: string;
  objective: string;
  systemPrompt: string;
  suggestedVocabulary: string[];
  passRules: {
    minScore: number;
    minTurns: number;
  };
  rewards: {
    exp: number;
    unlockNextLevel: string | null;
  };
}

export interface AdminAiLevelItem {
  id: string;
  level: string;
  title: string;
  description: string;
  minPlacementLevel: string;
  isActive: boolean;
  stageCount: number;
  stages: AdminAiStage[];
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AdminReportsResponse {
  summary: {
    totalUsers: number;
    totalExerciseAttempts: number;
    averageExercisePercent: number;
    totalSpeakingMinutes: number;
    aiSessionStatusBreakdown: MetricBreakdownItem[];
  };
  weeklyActivity: Array<{
    date: string;
    label: string;
    attempts: number;
    aiSessions: number;
  }>;
  levelDistribution: MetricBreakdownItem[];
  topExercises: Array<{
    exerciseId: string;
    title: string;
    attempts: number;
    averagePercent: number;
  }>;
}

export interface AdminExercisesResponse {
  items: AdminExerciseItem[];
}

export interface AdminVocabularyResponse {
  items: AdminVocabularySetItem[];
}

export interface AdminAiLevelsResponse {
  items: AdminAiLevelItem[];
}

export interface AdminExercisePayload {
  title: string;
  description: string;
  type: string;
  level: string;
  topic: string;
  coverImage: string;
  coverImageFile?: File | null;
  durationMinutes: number;
  rewardsXp: number;
  skills: string[];
  questions: Array<{
    prompt: string;
    question?: string;
    options: string[];
    correctAnswer: string | number;
    correctIndex?: number | null;
    explanation?: string;
    score?: number;
  }>;
}

export interface AdminVocabularyPayload {
  name: string;
  description: string;
  level: string;
  topic: string;
  coverImage?: string;
  coverImageFile?: File | null;
  isActive: boolean;
  sortOrder: number;
}

export interface AdminVocabularyWordPayload {
  word: string;
  meaning: string;
  example: string;
}

export interface AdminVocabularyWordsBulkPayload {
  mode: "append" | "replace";
  items: AdminVocabularyWordPayload[];
}

export interface AdminVocabularyWordsBulkResponse {
  insertedCount: number;
  replacedDeletedCount: number;
  items: AdminVocabularyWordItem[];
}

export interface AdminAiLevelPayload {
  level: string;
  title: string;
  description: string;
  minPlacementLevel: string;
  isActive: boolean;
  stages: AdminAiStage[];
}

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type PlacementSkillType =
  | "grammar"
  | "vocab"
  | "reading"
  | "listening";
export type PlacementQuestionType = "mcq" | "true_false" | "fill_blank";

export interface OnboardingProfileDraft {
  selectedLanguage: string;
  selectedLevel: string;
  weeklyHours: number;
  displayName: string;
  jobTitle: string;
  selectedGoals: string[];
  startedAt: string | null;
}

export interface AdminPlacementQuestionItem {
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
}

export interface AdminPlacementLevelRuleItem {
  id: string;
  level: CefrLevel;
  minScore: number;
  maxScore: number;
}

export interface AdminPlacementTestItem {
  id: string;
  title: string;
  description: string;
  instructions: string;
  durationMinutes: number;
  isActive: boolean;
  questionCount: number;
  activeQuestionCount: number;
  maxScore: number;
  questions: AdminPlacementQuestionItem[];
  levelRules: AdminPlacementLevelRuleItem[];
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AdminPlacementTestsResponse {
  items: AdminPlacementTestItem[];
}

export interface AdminPlacementTestPayload {
  title: string;
  description: string;
  instructions: string;
  durationMinutes: number;
  isActive: boolean;
  questions: AdminPlacementQuestionItem[];
  levelRules: AdminPlacementLevelRuleItem[];
}

export interface PlacementQuestionItem {
  id: string;
  prompt: string;
  instruction: string;
  passage: string;
  type: PlacementQuestionType;
  options: string[];
  skillType: PlacementSkillType;
  targetLevel: CefrLevel;
  weight: number;
  isActive: boolean;
}

export interface PlacementActiveTestItem {
  id: string;
  title: string;
  description: string;
  instructions: string;
  durationMinutes: number;
  questionCount: number;
  questions: PlacementQuestionItem[];
  createdAt: string | null;
  updatedAt: string | null;
}

export interface PlacementAnswerResult {
  questionId: string;
  selectedOptionIndex: number | null;
  isCorrect: boolean;
  earnedScore: number;
}

export interface PlacementSkillBreakdown {
  skillType: PlacementSkillType;
  earnedScore: number;
  maxScore: number;
  percent: number;
}

export interface PlacementResultItem {
  attemptId: string;
  testId: string | null;
  testTitle: string;
  rawScore: number;
  maxScore: number;
  percent: number;
  detectedLevel: CefrLevel;
  confirmedLevel: CefrLevel | null;
  status: "pending_confirmation" | "confirmed" | "skipped";
  skipped: boolean;
  answers: PlacementAnswerResult[];
  skillBreakdown: PlacementSkillBreakdown[];
  completedAt: string | null;
  confirmedAt: string | null;
  profile: OnboardingProfileDraft | null;
}

export interface PlacementSubmitPayload {
  testId: string;
  answersByQuestionId: Record<string, number>;
  profile: OnboardingProfileDraft;
}

export interface PlacementConfirmPayload {
  attemptId: string;
  confirmedLevel: CefrLevel;
}

export interface PlacementSkipPayload {
  profile: OnboardingProfileDraft;
}

export interface PlacementFinalizeResponse {
  user: User;
  result: PlacementResultItem;
}
