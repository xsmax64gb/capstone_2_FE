"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, GraduationCap } from "lucide-react";

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
  useConfirmPlacementResultMutation,
  useGetPlacementAttemptByIdQuery,
} from "@/store/services/placementApi";
import { useI18n } from "@/lib/i18n/context";
import type { AppLang } from "@/lib/i18n/messages";
import { getLevelsAtOrBelow } from "@/lib/placement";
import {
  clearOnboardingProfileDraft,
  loadOnboardingProfileDraft,
} from "@/lib/onboarding";
import type { CefrLevel, PlacementSkillType } from "@/types";

type PlacementResultCopy = {
  badge: string;
  title: string;
  subtitle: string;
  loadingResult: string;
  missingResult: string;
  summaryTitle: string;
  testLabel: string;
  detectedLevelLabel: string;
  rawLabel: string;
  percentLabel: string;
  selfEstimateLabel: string;
  nextStepTitle: string;
  nextStepDescription: string;
  chooseLevelTitle: string;
  chooseLevelDescription: string;
  recommendedLevel: string;
  saferLevel: string;
  breakdownTitle: string;
  continueButton: (level: CefrLevel) => string;
  confirmSuccessTitle: string;
  confirmSuccessDescription: (level: CefrLevel) => string;
  confirmErrorTitle: string;
  tryAgain: string;
  pointsLabel: (earnedScore: number, maxScore: number) => string;
  skillLabel: (skill: PlacementSkillType) => string;
};

const PAGE_COPY: Record<AppLang, PlacementResultCopy> = {
  vi: {
    badge: "Kết quả xếp trình độ",
    title: "Xác nhận trình độ để bắt đầu học",
    subtitle:
      "Hệ thống chỉ chấm điểm phần objective. Quyết định cuối cùng vẫn thuộc về bạn.",
    loadingResult: "Đang tải kết quả placement...",
    missingResult: "Không tìm thấy kết quả placement.",
    summaryTitle: "Tóm tắt kết quả",
    testLabel: "Bài test",
    detectedLevelLabel: "Hệ thống đang đánh giá bạn ở trình độ",
    rawLabel: "Điểm thô",
    percentLabel: "Tỷ lệ đúng",
    selfEstimateLabel: "Tự đánh giá",
    nextStepTitle: "Bạn có thể:",
    nextStepDescription:
      "Tiếp tục với level hệ thống đề xuất hoặc chọn một level thấp hơn nếu muốn học chắc nền tảng.",
    chooseLevelTitle: "Chọn level cuối cùng",
    chooseLevelDescription:
      "Chỉ cho phép chọn level bằng hoặc thấp hơn mức hệ thống detect được.",
    recommendedLevel: "Đề xuất từ hệ thống",
    saferLevel: "Học chắc hơn",
    breakdownTitle: "Breakdown theo kỹ năng",
    continueButton: (level) => `Tiếp tục với level ${level}`,
    confirmSuccessTitle: "Đã xác nhận trình độ",
    confirmSuccessDescription: (level) =>
      `Bạn sẽ tiếp tục lộ trình học với level ${level}.`,
    confirmErrorTitle: "Không thể xác nhận trình độ",
    tryAgain: "Vui lòng thử lại.",
    pointsLabel: (earnedScore, maxScore) => `${earnedScore}/${maxScore} điểm`,
    skillLabel: (skill) => {
      switch (skill) {
        case "grammar":
          return "Ngữ pháp";
        case "vocab":
          return "Từ vựng";
        case "reading":
          return "Đọc";
        case "listening":
          return "Nghe";
        default:
          return skill;
      }
    },
  },
  en: {
    badge: "Placement Result",
    title: "Confirm your level to start learning",
    subtitle:
      "The system only scores the objective section. The final decision is still yours.",
    loadingResult: "Loading placement result...",
    missingResult: "Placement result not found.",
    summaryTitle: "Result summary",
    testLabel: "Test",
    detectedLevelLabel: "The system currently estimates your level as",
    rawLabel: "Raw score",
    percentLabel: "Accuracy",
    selfEstimateLabel: "Self-estimate",
    nextStepTitle: "You can:",
    nextStepDescription:
      "Continue with the suggested level or choose a lower one if you want to strengthen your foundation first.",
    chooseLevelTitle: "Choose your final level",
    chooseLevelDescription:
      "You can only choose a level equal to or lower than the detected level.",
    recommendedLevel: "Recommended by the system",
    saferLevel: "Choose a safer level",
    breakdownTitle: "Skill breakdown",
    continueButton: (level) => `Continue with level ${level}`,
    confirmSuccessTitle: "Level confirmed",
    confirmSuccessDescription: (level) =>
      `You will continue your learning path at level ${level}.`,
    confirmErrorTitle: "Could not confirm the level",
    tryAgain: "Please try again.",
    pointsLabel: (earnedScore, maxScore) => `${earnedScore}/${maxScore} points`,
    skillLabel: (skill) => {
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
    },
  },
};

function PlacementResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId") || "";
  const { success, error } = useNotification();
  const { lang } = useI18n();
  const { data: result, isLoading } = useGetPlacementAttemptByIdQuery(
    attemptId,
    {
      skip: !attemptId,
    },
  );
  const [confirmPlacementResult, { isLoading: isConfirming }] =
    useConfirmPlacementResultMutation();

  const [selectedLevel, setSelectedLevel] = useState<CefrLevel>("A1");
  const copy = PAGE_COPY[lang];

  useEffect(() => {
    if (!attemptId) {
      router.replace("/onboarding");
      return;
    }
  }, [attemptId, router]);

  useEffect(() => {
    if (result) {
      setSelectedLevel(
        (result.confirmedLevel || result.detectedLevel) as CefrLevel,
      );
    }
  }, [result]);

  const profile = loadOnboardingProfileDraft();
  const levelOptions = useMemo(
    () =>
      result
        ? getLevelsAtOrBelow(result.detectedLevel)
        : (["A1"] as CefrLevel[]),
    [result],
  );

  const confirmLevel = async () => {
    if (!result) {
      return;
    }

    try {
      await confirmPlacementResult({
        attemptId: result.attemptId,
        confirmedLevel: selectedLevel,
      }).unwrap();
      clearOnboardingProfileDraft();
      success(
        copy.confirmSuccessTitle,
        copy.confirmSuccessDescription(selectedLevel),
      );
      router.replace("/exercises");
    } catch (reason) {
      error(
        copy.confirmErrorTitle,
        reason instanceof Error ? reason.message : copy.tryAgain,
      );
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 px-4 py-10">
        <div className="mx-auto w-full max-w-5xl space-y-6">
          <section className="rounded-[30px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
            <p className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
              <GraduationCap className="mr-1.5 h-3.5 w-3.5" />
              {copy.badge}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-2 max-w-3xl text-slate-600">{copy.subtitle}</p>
          </section>

          {!result ? (
            <Card className="border-slate-200 py-6">
              <CardContent className="text-sm text-slate-600">
                {isLoading ? copy.loadingResult : copy.missingResult}
              </CardContent>
            </Card>
          ) : (
            <section className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
              <Card className="border-slate-200 py-5">
                <CardHeader>
                  <CardTitle>{copy.summaryTitle}</CardTitle>
                  <CardDescription>
                    {copy.testLabel}: {result.testTitle}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                    <p className="text-sm text-emerald-700">
                      {copy.detectedLevelLabel}
                    </p>
                    <p className="mt-2 text-4xl font-semibold tracking-tight text-emerald-950">
                      {result.detectedLevel}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        {copy.rawLabel}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {result.rawScore}/{result.maxScore}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        {copy.percentLabel}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {result.percent}%
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        {copy.selfEstimateLabel}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {profile?.selectedLevel || "A1"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {copy.nextStepTitle}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {copy.nextStepDescription}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 py-5">
                <CardHeader>
                  <CardTitle>{copy.chooseLevelTitle}</CardTitle>
                  <CardDescription>
                    {copy.chooseLevelDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-3 md:grid-cols-3">
                    {levelOptions.map((level) => {
                      const selected = selectedLevel === level;

                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setSelectedLevel(level)}
                          className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                            selected
                              ? "border-slate-950 bg-slate-950 text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                          }`}
                        >
                          <p className="text-sm font-semibold">{level}</p>
                          <p
                            className={`mt-2 text-xs ${
                              selected ? "text-slate-200" : "text-slate-500"
                            }`}
                          >
                            {level === result.detectedLevel
                              ? copy.recommendedLevel
                              : copy.saferLevel}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-900">
                      {copy.breakdownTitle}
                    </p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {result.skillBreakdown.map((item) => (
                        <div
                          key={item.skillType}
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-slate-700">
                              {copy.skillLabel(item.skillType)}
                            </span>
                            <span className="text-sm font-semibold text-slate-950">
                              {item.percent}%
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-500">
                            {copy.pointsLabel(item.earnedScore, item.maxScore)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={confirmLevel}
                    disabled={isConfirming}
                    className="h-11 w-full text-sm font-semibold"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {copy.continueButton(selectedLevel)}
                  </Button>
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}

function PlacementResultFallback() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 px-4 py-10">
        <div className="mx-auto w-full max-w-5xl">
          <Card className="border-slate-200 py-6">
            <CardContent className="text-sm text-slate-600">
              Đang tải kết quả placement...
            </CardContent>
          </Card>
        </div>
      </main>
    </ProtectedRoute>
  );
}

export default function PlacementResultPage() {
  return (
    <Suspense fallback={<PlacementResultFallback />}>
      <PlacementResultContent />
    </Suspense>
  );
}
