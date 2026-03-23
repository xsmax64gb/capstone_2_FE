// Auth Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  name?: string;
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

export interface AdminVocabularyItem {
  id: string;
  word: string;
  meaning: string;
  phonetic: string;
  example: string;
  level: string;
  topic: string;
  imageUrl: string;
  audioUrl: string;
  createdAt: string | null;
  updatedAt: string | null;
}

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
  items: AdminVocabularyItem[];
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
  word: string;
  meaning: string;
  phonetic: string;
  example: string;
  level: string;
  topic: string;
  imageUrl: string;
  imageFile?: File | null;
  audioUrl: string;
}

export interface AdminAiLevelPayload {
  level: string;
  title: string;
  description: string;
  minPlacementLevel: string;
  isActive: boolean;
  stages: AdminAiStage[];
}
