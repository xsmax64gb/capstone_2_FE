"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

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
import {
  useGetActivePlacementTestQuery,
  useSkipPlacementTestMutation,
  useSubmitPlacementTestMutation,
} from "@/lib/api/placementApi";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import type { AppLang } from "@/lib/i18n/messages";
import {
  clearOnboardingProfileDraft,
  getOnboardingLanguageOption,
  loadOnboardingProfileDraft,
} from "@/lib/onboarding";

type PlacementTestCopy = {
  badge: string;
  title: string;
  subtitle: string;
  backButton: string;
  profileTitle: string;
  profileDescription: string;
  displayNameLabel: string;
  languageLabel: string;
  selfEstimateLabel: string;
  weeklyHoursLabel: string;
  skipHint: string;
  skipButton: string;
  noActiveTestTitle: string;
  noActiveTestDescription: string;
  noActiveTestBody: string;
  loadingTest: string;
  questionLabel: (index: number) => string;
  submitButton: string;
  submitButtonLoading: string;
  noActiveWarningTitle: string;
  noActiveWarningDescription: string;
  incompleteWarningTitle: string;
  incompleteWarningDescription: string;
  submitSuccessTitle: string;
  submitSuccessDescription: string;
  submitErrorTitle: string;
  skipSuccessTitle: string;
  skipSuccessDescription: string;
  skipErrorTitle: string;
  tryAgain: string;
};

const PAGE_COPY: Record<AppLang, PlacementTestCopy> = {
  vi: {
    badge: "Bài kiểm tra đầu vào",
    title: "Bài kiểm tra đầu vào",
    subtitle:
      "Hệ thống sẽ chấm điểm phần objective, sau đó gợi ý level để bạn xác nhận lần cuối.",
    backButton: "Quay lại onboarding",
    profileTitle: "Hồ sơ tạm lưu",
    profileDescription: "Dùng để tham chiếu, không phải kết quả level cuối cùng.",
    displayNameLabel: "Tên hiển thị",
    languageLabel: "Ngôn ngữ giao diện",
    selfEstimateLabel: "Tự đánh giá",
    weeklyHoursLabel: "Giờ học / tuần",
    skipHint:
      "Nếu bạn không muốn làm placement test, bạn có thể bỏ qua và vào học từ A1 ngay.",
    skipButton: "Bỏ qua bài test và học từ A1",
    noActiveTestTitle: "Chưa có bài test đang active",
    noActiveTestDescription:
      "Admin cần kích hoạt một placement test để học viên mới có thể làm bài.",
    noActiveTestBody:
      "Hiện tại chưa có bài placement test active. Bạn vẫn có thể bỏ qua để vào học từ A1.",
    loadingTest: "Đang tải bài placement test...",
    questionLabel: (index) => `Câu ${index + 1}`,
    submitButton: "Hoàn tất bài test",
    submitButtonLoading: "Đang nộp bài...",
    noActiveWarningTitle: "Chưa có bài test active",
    noActiveWarningDescription: "Admin cần kích hoạt một bài test đầu vào.",
    incompleteWarningTitle: "Bạn chưa hoàn tất bài test",
    incompleteWarningDescription: "Vui lòng trả lời hết các câu hỏi active.",
    submitSuccessTitle: "Đã nộp bài placement",
    submitSuccessDescription: "Hệ thống đang đề xuất trình độ phù hợp cho bạn.",
    submitErrorTitle: "Không thể nộp bài placement",
    skipSuccessTitle: "Bỏ qua bài test",
    skipSuccessDescription:
      "Bạn sẽ bắt đầu học với level A1 và có thể quay lại làm placement test sau.",
    skipErrorTitle: "Không thể bỏ qua bài test",
    tryAgain: "Vui lòng thử lại.",
  },
  en: {
    badge: "Placement Test",
    title: "Placement test",
    subtitle:
      "The system will score the objective section, then suggest a level for your final confirmation.",
    backButton: "Back to onboarding",
    profileTitle: "Saved profile",
    profileDescription: "For reference only, not your final level result.",
    displayNameLabel: "Display name",
    languageLabel: "Interface language",
    selfEstimateLabel: "Self-estimate",
    weeklyHoursLabel: "Study hours / week",
    skipHint:
      "If you do not want to take the placement test, you can skip it and start learning from A1 right away.",
    skipButton: "Skip the test and start from A1",
    noActiveTestTitle: "No active test yet",
    noActiveTestDescription:
      "An admin needs to activate a placement test for new learners.",
    noActiveTestBody:
      "There is no active placement test right now. You can still skip it and start from A1.",
    loadingTest: "Loading the placement test...",
    questionLabel: (index) => `Question ${index + 1}`,
    submitButton: "Finish the test",
    submitButtonLoading: "Submitting...",
    noActiveWarningTitle: "No active test available",
    noActiveWarningDescription:
      "An admin needs to activate a placement test first.",
    incompleteWarningTitle: "You have not finished the test",
    incompleteWarningDescription: "Please answer all active questions.",
    submitSuccessTitle: "Placement test submitted",
    submitSuccessDescription:
      "The system is recommending the right level for you.",
    submitErrorTitle: "Could not submit the placement test",
    skipSuccessTitle: "Placement test skipped",
    skipSuccessDescription:
      "You will start at A1 and can come back to take the placement test later.",
    skipErrorTitle: "Could not skip the placement test",
    tryAgain: "Please try again.",
  },
};

export default function PlacementTestPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { error, success, warning } = useNotification();
  const { lang } = useI18n();
  const { data: test, isLoading } = useGetActivePlacementTestQuery();
  const [submitPlacementTest, { isLoading: isSubmittingPlacement }] =
    useSubmitPlacementTestMutation();
  const [skipPlacementTestMutation] = useSkipPlacementTestMutation();

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const copy = PAGE_COPY[lang];
  const profile = loadOnboardingProfileDraft();
  const activeQuestions = useMemo(() => test?.questions ?? [], [test]);
  const selectedLanguageLabel =
    getOnboardingLanguageOption(profile?.selectedLanguage)?.label[lang] ||
    (lang === "vi" ? "Tiếng Việt" : "Vietnamese");

  const handleSubmit = async () => {
    if (!test) {
      warning(copy.noActiveWarningTitle, copy.noActiveWarningDescription);
      return;
    }

    if (activeQuestions.some((question) => !Number.isInteger(answers[question.id]))) {
      warning(copy.incompleteWarningTitle, copy.incompleteWarningDescription);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitPlacementTest({
        testId: test.id,
        answersByQuestionId: answers,
        profile:
          profile ?? {
            selectedLanguage: lang,
            selectedLevel: "A1",
            weeklyHours: 0,
            displayName: user?.fullName || "",
            jobTitle: "",
            selectedGoals: [],
            startedAt: new Date().toISOString(),
          },
      }).unwrap();
      success(copy.submitSuccessTitle, copy.submitSuccessDescription);
      router.push(`/onboarding/result?attemptId=${result.attemptId}`);
    } catch (reason) {
      error(
        copy.submitErrorTitle,
        reason instanceof Error ? reason.message : copy.tryAgain,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const skipPlacementTest = async () => {
    if (!user) {
      return;
    }

    setIsSubmitting(true);

    try {
      await skipPlacementTestMutation({
        profile:
          profile ?? {
            selectedLanguage: lang,
            selectedLevel: "A1",
            weeklyHours: 0,
            displayName: user.fullName || "",
            jobTitle: "",
            selectedGoals: [],
            startedAt: new Date().toISOString(),
          },
      }).unwrap();
      clearOnboardingProfileDraft();
      success(copy.skipSuccessTitle, copy.skipSuccessDescription);
      router.replace("/exercises");
    } catch (reason) {
      error(
        copy.skipErrorTitle,
        reason instanceof Error ? reason.message : copy.tryAgain,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-sky-50/30 px-4 py-10">
        <div className="mx-auto w-full max-w-5xl space-y-6">
          <section className="rounded-[30px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  {copy.badge}
                </p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  {copy.title}
                </h1>
                <p className="mt-2 max-w-3xl text-slate-600">{copy.subtitle}</p>
              </div>

              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => router.push("/onboarding")}
              >
                <ArrowLeft className="h-4 w-4" />
                {copy.backButton}
              </Button>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
            <Card className="border-slate-200 py-5">
              <CardHeader>
                <CardTitle>{copy.profileTitle}</CardTitle>
                <CardDescription>{copy.profileDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  {copy.displayNameLabel}:{" "}
                  <span className="font-semibold text-slate-900">
                    {profile?.displayName || user?.fullName || "N/A"}
                  </span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  {copy.languageLabel}:{" "}
                  <span className="font-semibold text-slate-900">
                    {selectedLanguageLabel}
                  </span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  {copy.selfEstimateLabel}:{" "}
                  <span className="font-semibold text-slate-900">
                    {profile?.selectedLevel || "A1"}
                  </span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  {copy.weeklyHoursLabel}:{" "}
                  <span className="font-semibold text-slate-900">
                    {profile?.weeklyHours || 0}
                  </span>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-900">
                  {copy.skipHint}
                </div>

                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={skipPlacementTest}
                  disabled={isSubmitting}
                >
                  {copy.skipButton}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-slate-200 py-5">
              <CardHeader>
                <CardTitle>{test?.title || copy.noActiveTestTitle}</CardTitle>
                <CardDescription>
                  {test?.instructions || copy.noActiveTestDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {isLoading ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-sm text-slate-600">
                    {copy.loadingTest}
                  </div>
                ) : !test ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-sm text-slate-600">
                    {copy.noActiveTestBody}
                  </div>
                ) : (
                  <>
                    {activeQuestions.map((question, index) => (
                      <article
                        key={question.id}
                        className="rounded-3xl border border-slate-200 bg-slate-50/60 p-5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-900">
                            {copy.questionLabel(index)}
                          </p>
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
                            {question.skillType} • {question.targetLevel}
                          </span>
                        </div>
                        <p className="mt-3 text-base font-semibold text-slate-950">
                          {question.prompt}
                        </p>
                        {question.instruction ? (
                          <p className="mt-2 text-sm text-slate-500">
                            {question.instruction}
                          </p>
                        ) : null}
                        {question.passage ? (
                          <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-600">
                            {question.passage}
                          </div>
                        ) : null}

                        <div className="mt-4 grid gap-3">
                          {question.options.map((option, optionIndex) => {
                            const selected = answers[question.id] === optionIndex;

                            return (
                              <button
                                key={`${question.id}-${optionIndex}`}
                                type="button"
                                onClick={() =>
                                  setAnswers((current) => ({
                                    ...current,
                                    [question.id]: optionIndex,
                                  }))
                                }
                                className={`rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
                                  selected
                                    ? "border-slate-900 bg-slate-900 text-white"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                                }`}
                              >
                                {String.fromCharCode(65 + optionIndex)}. {option}
                              </button>
                            );
                          })}
                        </div>
                      </article>
                    ))}

                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || isSubmittingPlacement}
                      className="h-11 w-full text-sm font-semibold"
                    >
                      {isSubmitting ? copy.submitButtonLoading : copy.submitButton}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}
