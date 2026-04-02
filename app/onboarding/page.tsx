"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Languages,
  Rocket,
  Sparkles,
} from "lucide-react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNotification } from "@/hooks/use-notification";
import { useSkipPlacementTestMutation } from "@/store/services/placementApi";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import type { AppLang } from "@/lib/i18n/messages";
import {
  clearOnboardingProfileDraft,
  getLocalizedText,
  getOnboardingLanguageOption,
  ONBOARDING_GOAL_OPTIONS,
  ONBOARDING_LANGUAGE_OPTIONS,
  ONBOARDING_LEVEL_OPTIONS,
  ONBOARDING_TEST_PREVIEW,
  ONBOARDING_WEEKLY_HOURS,
  saveOnboardingProfileDraft,
} from "@/lib/onboarding";
import type { OnboardingProfileDraft } from "@/types";

type Step = 0 | 1 | 2;

type OnboardingPageCopy = {
  badge: string;
  title: string;
  subtitle: string;
  languageStepTitle: string;
  languageStepDescription: string;
  profileStepTitle: string;
  profileStepDescription: string;
  displayNameLabel: string;
  displayNamePlaceholder: string;
  jobTitleLabel: string;
  jobTitlePlaceholder: string;
  levelLabel: string;
  weeklyHoursLabel: string;
  goalsLabel: string;
  reviewStepTitle: string;
  reviewStepDescription: string;
  summaryTitle: string;
  summaryDisplayName: string;
  summaryLanguage: string;
  summaryLevel: string;
  summarySchedule: string;
  summaryGoals: string;
  previewTitle: string;
  notProvided: string;
  startButton: string;
  startButtonLoading: string;
  skipButton: string;
  backButton: string;
  continueButton: string;
  savedTitle: string;
  savedDescription: string;
  skipSuccessTitle: string;
  skipSuccessDescription: string;
  skipErrorTitle: string;
  tryAgain: string;
  goalsCount: (count: number) => string;
  weeklyHoursOption: (hours: number) => string;
};

const PAGE_COPY: Record<AppLang, OnboardingPageCopy> = {
  vi: {
    badge: "Thiết lập cho học viên mới",
    title: "Chào mừng bạn đến với lộ trình học cá nhân hóa",
    subtitle:
      "Chỉ cần 3 bước ngắn để hệ thống đề xuất bài kiểm tra đầu vào phù hợp với mục tiêu của bạn.",
    languageStepTitle: "Chọn ngôn ngữ ưu tiên",
    languageStepDescription: "Bạn có thể đổi lại bất cứ lúc nào trong cài đặt.",
    profileStepTitle: "Thông tin học tập cơ bản",
    profileStepDescription:
      "Hệ thống sẽ dùng thông tin này để điều hướng bài kiểm tra đầu vào và lộ trình học.",
    displayNameLabel: "Tên hiển thị",
    displayNamePlaceholder: "Nhập tên bạn muốn hiển thị",
    jobTitleLabel: "Nghề nghiệp (tùy chọn)",
    jobTitlePlaceholder: "VD: Kỹ sư phần mềm",
    levelLabel: "Ước tính trình độ hiện tại",
    weeklyHoursLabel: "Số giờ học mỗi tuần",
    goalsLabel: "Mục tiêu ưu tiên",
    reviewStepTitle: "Sẵn sàng bắt đầu bài kiểm tra đầu vào",
    reviewStepDescription:
      "Hệ thống đã tổng hợp hồ sơ học tập của bạn và sẽ mở bài placement test đang active do admin đã chọn.",
    summaryTitle: "Tóm tắt nhanh",
    summaryDisplayName: "Tên hiển thị",
    summaryLanguage: "Ngôn ngữ giao diện",
    summaryLevel: "Level dự kiến",
    summarySchedule: "Lịch học",
    summaryGoals: "Mục tiêu",
    previewTitle: "Bài test sẽ bao gồm",
    notProvided: "(chưa nhập)",
    startButton: "Bắt đầu bài test đầu vào",
    startButtonLoading: "Đang khởi tạo bài test...",
    skipButton: "Bỏ qua bài test và học từ A1",
    backButton: "Quay lại",
    continueButton: "Tiếp tục",
    savedTitle: "Đã lưu thông tin onboarding",
    savedDescription: "Hệ thống sẽ mở bài placement test đang active cho bạn.",
    skipSuccessTitle: "Bỏ qua bài test",
    skipSuccessDescription:
      "Bạn sẽ bắt đầu học với level A1 và có thể làm placement test sau.",
    skipErrorTitle: "Không thể bỏ qua bài test",
    tryAgain: "Vui lòng thử lại.",
    goalsCount: (count) => `${count} lựa chọn`,
    weeklyHoursOption: (hours) => `${hours} giờ / tuần`,
  },
  en: {
    badge: "New Learner Setup",
    title: "Welcome to your personalized learning path",
    subtitle:
      "Complete 3 short steps so the system can recommend the right placement test for your goals.",
    languageStepTitle: "Choose your preferred language",
    languageStepDescription: "You can change this anytime in settings.",
    profileStepTitle: "Basic learning profile",
    profileStepDescription:
      "The system uses this information to tailor your placement test and learning path.",
    displayNameLabel: "Display name",
    displayNamePlaceholder: "Enter the name you want to show",
    jobTitleLabel: "Job title (optional)",
    jobTitlePlaceholder: "e.g. Software Engineer",
    levelLabel: "Current estimated level",
    weeklyHoursLabel: "Weekly study hours",
    goalsLabel: "Priority goals",
    reviewStepTitle: "Ready to start your placement test",
    reviewStepDescription:
      "Your learning profile is ready. The system will open the active placement test selected by the admin.",
    summaryTitle: "Quick summary",
    summaryDisplayName: "Display name",
    summaryLanguage: "Interface language",
    summaryLevel: "Estimated level",
    summarySchedule: "Study plan",
    summaryGoals: "Goals",
    previewTitle: "The test will include",
    notProvided: "(not provided)",
    startButton: "Start placement test",
    startButtonLoading: "Preparing your test...",
    skipButton: "Skip the test and start from A1",
    backButton: "Back",
    continueButton: "Continue",
    savedTitle: "Onboarding profile saved",
    savedDescription: "The system will open the active placement test for you.",
    skipSuccessTitle: "Placement test skipped",
    skipSuccessDescription:
      "You will start at A1 and can take the placement test later.",
    skipErrorTitle: "Could not skip the placement test",
    tryAgain: "Please try again.",
    goalsCount: (count) => `${count} selected`,
    weeklyHoursOption: (hours) => `${hours} hours / week`,
  },
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { error, success } = useNotification();
  const { lang, setLang } = useI18n();
  const [skipPlacementTestMutation, { isLoading: isSkippingPlacement }] =
    useSkipPlacementTestMutation();

  const [step, setStep] = useState<Step>(0);
  const [isStartingTest, setIsStartingTest] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState<AppLang>("vi");
  const [selectedLevel, setSelectedLevel] = useState("A1");
  const [weeklyHours, setWeeklyHours] = useState(4);
  const [displayName, setDisplayName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const copy = PAGE_COPY[lang];

  useEffect(() => {
    if (user?.onboardingDone) {
      router.replace("/exercises");
    }
  }, [router, user?.onboardingDone]);

  useEffect(() => {
    setSelectedLanguage(lang);
  }, [lang]);

  useEffect(() => {
    if (user?.fullName) {
      setDisplayName(user.fullName);
    }
  }, [user?.fullName]);

  const progressPercent = useMemo(() => ((step + 1) / 3) * 100, [step]);
  const selectedLanguageLabel =
    getOnboardingLanguageOption(selectedLanguage)?.label[lang] ||
    selectedLanguage.toUpperCase();

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) => {
      if (prev.includes(goalId)) {
        return prev.filter((id) => id !== goalId);
      }
      return [...prev, goalId];
    });
  };

  const canGoNextStep0 = !!selectedLanguage;
  const canGoNextStep1 =
    displayName.trim().length >= 2 &&
    selectedGoals.length > 0 &&
    Number.isFinite(weeklyHours) &&
    weeklyHours > 0;

  const handleLanguageSelect = (nextLanguage: AppLang) => {
    setSelectedLanguage(nextLanguage);
    setLang(nextLanguage);
  };

  const nextStep = () => {
    if (step === 0 && !canGoNextStep0) return;
    if (step === 1 && !canGoNextStep1) return;
    setStep((prev) => {
      if (prev === 0) return 1;
      if (prev === 1) return 2;
      return 2;
    });
  };

  const prevStep = () => {
    setStep((prev) => {
      if (prev === 2) return 1;
      if (prev === 1) return 0;
      return 0;
    });
  };

  const buildDraftPayload = (): OnboardingProfileDraft => ({
    selectedLanguage,
    selectedLevel,
    weeklyHours,
    displayName,
    jobTitle,
    selectedGoals,
    startedAt: new Date().toISOString(),
  });

  const startPlacementTest = async () => {
    if (!user) {
      return;
    }

    setIsStartingTest(true);

    try {
      saveOnboardingProfileDraft(buildDraftPayload());
      success(copy.savedTitle, copy.savedDescription);
      router.push("/onboarding/placement-test");
    } finally {
      setIsStartingTest(false);
    }
  };

  const skipPlacementTest = async () => {
    if (!user) {
      return;
    }

    setIsStartingTest(true);
    const draftPayload = buildDraftPayload();

    try {
      saveOnboardingProfileDraft(draftPayload);
      await skipPlacementTestMutation({ profile: draftPayload }).unwrap();
      clearOnboardingProfileDraft();

      success(copy.skipSuccessTitle, copy.skipSuccessDescription);
      router.replace("/exercises");
    } catch (reason) {
      error(
        copy.skipErrorTitle,
        reason instanceof Error ? reason.message : copy.tryAgain,
      );
    } finally {
      setIsStartingTest(false);
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 px-4 py-10">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-6 animate-fade-up">
            <p className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              {copy.badge}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-2 text-slate-600">{copy.subtitle}</p>
          </div>

          <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-slate-900 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {step === 0 && (
            <Card className="animate-fade-up border-slate-200 bg-white/95 backdrop-blur">
              <CardHeader>
                <CardTitle className="inline-flex items-center text-2xl">
                  <Languages className="mr-2 h-5 w-5" />
                  {copy.languageStepTitle}
                </CardTitle>
                <CardDescription>{copy.languageStepDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {ONBOARDING_LANGUAGE_OPTIONS.map((option) => {
                    const selected = option.id === selectedLanguage;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleLanguageSelect(option.id)}
                        className={`rounded-xl border p-4 text-left transition-all ${
                          selected
                            ? "border-black bg-black text-white shadow-lg"
                            : "border-slate-200 bg-white text-slate-800 hover:border-slate-400"
                        }`}
                      >
                        <p className="font-semibold">
                          {getLocalizedText(option.label, lang)}
                        </p>
                        <p
                          className={`mt-1 text-sm ${
                            selected ? "text-slate-200" : "text-slate-500"
                          }`}
                        >
                          {getLocalizedText(option.description, lang)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {step === 1 && (
            <Card className="animate-fade-up border-slate-200 bg-white/95 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl">{copy.profileStepTitle}</CardTitle>
                <CardDescription>{copy.profileStepDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">
                      {copy.displayNameLabel}
                    </span>
                    <input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={copy.displayNamePlaceholder}
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-black"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">
                      {copy.jobTitleLabel}
                    </span>
                    <input
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder={copy.jobTitlePlaceholder}
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-black"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">
                      {copy.levelLabel}
                    </span>
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-black"
                    >
                      {ONBOARDING_LEVEL_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {getLocalizedText(option.label, lang)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">
                      {copy.weeklyHoursLabel}
                    </span>
                    <select
                      value={weeklyHours}
                      onChange={(e) => setWeeklyHours(Number(e.target.value))}
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-black"
                    >
                      {ONBOARDING_WEEKLY_HOURS.map((hour) => (
                        <option key={hour} value={hour}>
                          {copy.weeklyHoursOption(hour)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700">
                    {copy.goalsLabel}
                  </p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {ONBOARDING_GOAL_OPTIONS.map((goal) => {
                      const selected = selectedGoals.includes(goal.id);
                      return (
                        <button
                          key={goal.id}
                          type="button"
                          onClick={() => toggleGoal(goal.id)}
                          className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                            selected
                              ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {getLocalizedText(goal.label, lang)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="animate-fade-up border-slate-200 bg-white/95 backdrop-blur">
              <CardHeader>
                <CardTitle className="inline-flex items-center text-2xl">
                  <Rocket className="mr-2 h-5 w-5" />
                  {copy.reviewStepTitle}
                </CardTitle>
                <CardDescription>{copy.reviewStepDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">
                    {copy.summaryTitle}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-600">
                    <li>
                      {copy.summaryDisplayName}: {displayName || copy.notProvided}
                    </li>
                    <li>
                      {copy.summaryLanguage}: {selectedLanguageLabel}
                    </li>
                    <li>
                      {copy.summaryLevel}: {selectedLevel}
                    </li>
                    <li>
                      {copy.summarySchedule}: {copy.weeklyHoursOption(weeklyHours)}
                    </li>
                    <li>
                      {copy.summaryGoals}: {copy.goalsCount(selectedGoals.length)}
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-900">
                    {copy.previewTitle}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-emerald-800">
                    {ONBOARDING_TEST_PREVIEW.map((item) => (
                      <li
                        key={item.vi}
                        className="inline-flex items-center"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {getLocalizedText(item, lang)}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={startPlacementTest}
                  disabled={isStartingTest}
                  className="h-11 w-full text-sm font-semibold"
                >
                  {isStartingTest ? copy.startButtonLoading : copy.startButton}
                </Button>

                <Button
                  variant="outline"
                  onClick={skipPlacementTest}
                  disabled={isStartingTest || isSkippingPlacement}
                  className="h-11 w-full text-sm font-semibold"
                >
                  {copy.skipButton}
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 0 || isStartingTest || isSkippingPlacement}
              className="min-w-[120px]"
            >
              <ChevronLeft className="mr-1.5 h-4 w-4" />
              {copy.backButton}
            </Button>

            {step < 2 && (
              <Button
                onClick={nextStep}
                disabled={
                  (step === 0 && !canGoNextStep0) ||
                  (step === 1 && !canGoNextStep1)
                }
                className="min-w-[120px]"
              >
                {copy.continueButton}
                <ChevronRight className="ml-1.5 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
