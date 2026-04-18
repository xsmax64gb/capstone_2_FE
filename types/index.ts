//các type cho toàn bộ ứng dụng, bao gồm cả auth, api response, notification, admin dashboard, placement test, v.v. Giúp định nghĩa rõ ràng cấu trúc dữ liệu và giao diện giữa các phần của ứng dụng. nhận res đồng bộ
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
  isActive?: boolean;
  currentLevel?: string;
  exp?: number;
  onboardingDone?: boolean;
  placementScore?: number;
  avatarUrl?: string;
  lastActiveAt?: string;
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
    activeUsers?: number;
    inactiveUsers?: number;
    averagePlacementScore: number;
  };
  breakdowns: {
    byLevel: MetricBreakdownItem[];
    byRole: MetricBreakdownItem[];
    byStatus?: MetricBreakdownItem[];
  };
  filters?: {
    query?: string;
    role?: string;
    level?: string;
    onboardingDone?: boolean | null;
    isActive?: boolean | null;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  users: User[];
}

export interface AdminUsersQueryParams {
  page?: number;
  limit?: number;
  query?: string;
  role?: string;
  level?: string;
  onboardingDone?: "all" | "true" | "false";
  isActive?: "all" | "true" | "false";
  sortBy?:
    | "createdAt"
    | "updatedAt"
    | "fullName"
    | "email"
    | "exp"
    | "placementScore"
    | "lastActiveAt";
  sortOrder?: "asc" | "desc";
}

export interface AdminCreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  role: "user" | "admin";
  currentLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  exp?: number;
  onboardingDone?: boolean;
  isActive?: boolean;
  bio?: string;
  nativeLanguage?: string;
  timezone?: string;
  avatarUrl?: string;
}

export interface AdminUpdateUserPayload {
  fullName?: string;
  email?: string;
  role?: "user" | "admin";
  currentLevel?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  exp?: number;
  onboardingDone?: boolean;
  isActive?: boolean;
  bio?: string;
  nativeLanguage?: string;
  timezone?: string;
  avatarUrl?: string;
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

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type PlacementSkillType = "grammar" | "vocab" | "reading" | "listening";
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
  audioUrl?: string;
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

export interface AdminGeneratePlacementWithAiPayload {
  title: string;
  context: string;
  levelFrom: CefrLevel;
  levelTo: CefrLevel;
  listeningQuestions: number;
  readingQuestions: number;
  grammarQuestions: number;
  vocabQuestions: number;
  durationMinutes: number;
  description?: string;
  instructions?: string;
  isActive: boolean;
}

export interface PlacementQuestionItem {
  id: string;
  prompt: string;
  instruction: string;
  passage: string;
  audioUrl?: string;
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
  allowPartial?: boolean;
  autoSubmitted?: boolean;
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

export type PaymentMethod = "bank_transfer" | "cash" | "card";
export type PaymentStatus = "pending" | "paid" | "failed";
export type PaymentPackageBillingCycle =
  | "month"
  | "quarter"
  | "year"
  | "one_time";
export type PaymentFeatureAccessLevel =
  | "basic"
  | "standard"
  | "advanced"
  | "full";
export type PaymentFeatureScopePeriod =
  | "day"
  | "week"
  | "month"
  | "billing_cycle"
  | "lifetime";

export interface PaymentFeatureScope {
  featureKey: string;
  accessLevel: PaymentFeatureAccessLevel;
  quota: number | null;
  quotaPeriod: PaymentFeatureScopePeriod;
  note: string;
}

export interface PaymentQrData {
  provider: "vietqr";
  qrImageUrl: string;
  bankCode: string;
  accountNumber: string;
  accountName: string | null;
  transferContent: string;
  amount: number;
  currency: string;
}

export interface PaymentRecord {
  id: string;
  invoiceNumber: string;
  externalRef: string | null;
  pricingKey: string | null;
  packageId: string | null;
  packageSlug: string | null;
  packageName: string | null;
  packageFeatureKeys: string[];
  packageFeatureScopes: PaymentFeatureScope[];
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  xgateReference: string | null;
  matchedContent: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  paidAt: string | null;
  syncedAt: string | null;
  expiresAt: string | null;
  failureReason: string | null;
  isExpired: boolean;
  paymentQr?: PaymentQrData | null;
  paymentQrSetupError?: string | null;
}

export interface PaymentPackageFeature {
  key: string;
  label: string;
  description: string;
  category: string;
}

export interface PaymentPackage {
  id: string;
  name: string;
  slug: string;
  isDefault: boolean;
  description: string;
  price: number;
  currency: string;
  billingCycle: PaymentPackageBillingCycle;
  featureKeys: string[];
  featureScopes: PaymentFeatureScope[];
  isActive: boolean;
  displayOrder: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface PaymentPackageCatalogResponse {
  packages: PaymentPackage[];
  featureCatalog: PaymentPackageFeature[];
  scopeConfig?: {
    accessLevelOptions: PaymentFeatureAccessLevel[];
    quotaPeriodOptions: PaymentFeatureScopePeriod[];
  };
  activeLimit: number;
}

export interface PaymentPackageUpsertRequest {
  name: string;
  slug?: string;
  description: string;
  price: number;
  currency?: string;
  billingCycle: PaymentPackageBillingCycle;
  featureKeys: string[];
  featureScopes?: PaymentFeatureScope[];
  isActive: boolean;
  displayOrder: number;
}

export interface FeatureQuotaItem {
  featureKey: string;
  featureLabel: string;
  enabled: boolean;
  accessLevel: PaymentFeatureAccessLevel | null;
  quota: number | null;
  used: number | null;
  remaining: number | null;
  isUnlimited: boolean;
  isBlocked: boolean;
  quotaPeriod: PaymentFeatureScopePeriod | null;
  quotaPeriodLabel: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  note: string;
}

export interface FeatureQuotaOverviewResponse {
  generatedAt: string;
  packageName: string;
  packageSlug: string | null;
  billingCycle: PaymentPackageBillingCycle;
  source: "paid_payment" | "default_package";
  features: FeatureQuotaItem[];
}

export interface PaymentSyncSummary {
  source: string;
  startedAt: string;
  finishedAt: string;
  pendingChecked: number;
  matchedPayments: number;
  updatedPayments: number;
  xgateRequests: number;
  xgateTransactions: number;
  skippedByRateLimit: boolean;
  status: string;
  message: string;
}

export interface PaymentCreateRequest {
  packageId?: string;
  packageSlug?: string;
  externalRef?: string;
  pricingKey?: string;
  amount?: number;
  currency?: string;
  paymentMethod?: PaymentMethod;
}

export interface PaymentReconcileResponse {
  invoiceNumber: string;
  allowProceed: boolean;
  payment: PaymentRecord;
  syncSummary: PaymentSyncSummary;
}

export interface PaymentCancelResponse {
  invoiceNumber: string;
  cancelled: boolean;
  payment: PaymentRecord | null;
}

export type PaymentVerifyRequest =
  | ({ action: "create" } & PaymentCreateRequest)
  | {
      action: "verify";
      invoiceNumber: string;
      externalRef?: string;
    };

export interface PaymentVerifyResponse {
  action: "create" | "verify";
  allowProceed: boolean;
  payment: PaymentRecord;
  nextStep?: string;
  decision?: string;
}

export interface RevenueRange {
  from: string;
  to: string;
  label: string;
  rangeDays: number;
}

export interface AdminRevenueOverviewResponse {
  range: RevenueRange;
  summary: {
    systemRevenue: number;
    systemPaidTransactions: number;
    revenueInRange: number;
    paidTransactions: number;
    pendingTransactions: number;
    failedTransactions: number;
    successRate: number;
    averageTicket: number;
    latestPaidAt: string | null;
    currency: string;
  };
}

export interface AdminRevenueChartPoint {
  date: string;
  label: string;
  revenue: number;
  paidTransactions: number;
}

export interface AdminRevenueChartResponse {
  range: RevenueRange;
  timezone: string;
  points: AdminRevenueChartPoint[];
  totals: {
    revenue: number;
    paidTransactions: number;
    currency: string;
  };
}

export interface RevenueBreakdownItem {
  key: string;
  count: number;
  amount: number;
}

export interface AdminRevenueRecentPaidItem {
  invoiceNumber: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  pricingKey: string | null;
  externalRef: string | null;
  xgateReference: string | null;
  paidAt: string | null;
}

export interface AdminRevenueStatisticsResponse {
  range: RevenueRange;
  totals: {
    transactions: number;
    currency: string;
  };
  breakdowns: {
    status: RevenueBreakdownItem[];
    paymentMethod: RevenueBreakdownItem[];
    pricing: RevenueBreakdownItem[];
  };
  recentPaid: AdminRevenueRecentPaidItem[];
}
