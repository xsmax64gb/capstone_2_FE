"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useDispatch } from "react-redux";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { setUser } from "@/lib/slices/authSlice";
import { useNotification } from "@/hooks/use-notification";
import { useAuth } from "@/lib/auth-context";
import {
  buildOnboardingCompletedUser,
  createSkippedPlacementResult,
  getActivePlacementTest,
  loadOnboardingProfileDraft,
  savePlacementResult,
  scorePlacementTest,
  type PlacementTest,
} from "@/lib/mock/placement-tests";

export default function PlacementTestPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { success, warning } = useNotification();

  const [test, setTest] = useState<PlacementTest | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTest(getActivePlacementTest());
  }, []);

  const profile = loadOnboardingProfileDraft();
  const activeQuestions = useMemo(
    () => test?.questions.filter((question) => question.isActive) ?? [],
    [test],
  );

  const handleSubmit = () => {
    if (!test) {
      warning("Chua co bai test active", "Admin can kich hoat mot bai test dau vao.");
      return;
    }

    if (activeQuestions.some((question) => !Number.isInteger(answers[question.id]))) {
      warning("Ban chua hoan tat bai test", "Vui long tra loi het cac cau hoi active.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = scorePlacementTest(test, answers);
      savePlacementResult(result);
      success("Da nop bai placement", "He thong dang de xuat trinh do phu hop cho ban.");
      router.push("/onboarding/result");
    } finally {
      setIsSubmitting(false);
    }
  };

  const skipPlacementTest = () => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      savePlacementResult(createSkippedPlacementResult(test));
      dispatch(
        setUser(
          buildOnboardingCompletedUser(user, {
            level: "A1",
            placementScore: 0,
            displayName: profile?.displayName,
          }),
        ),
      );
      success(
        "Bo qua bai test",
        "Ban se bat dau hoc voi level A1 va co the quay lai lam placement test sau.",
      );
      router.replace("/exercises");
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
                  Placement Test
                </p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  Bai test dau vao
                </h1>
                <p className="mt-2 max-w-3xl text-slate-600">
                  He thong se cham diem objective, sau do goi y level va de ban xac nhan lan cuoi.
                </p>
              </div>

              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => router.push("/onboarding")}
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lai onboarding
              </Button>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
            <Card className="border-slate-200 py-5">
              <CardHeader>
                <CardTitle>Profile draft</CardTitle>
                <CardDescription>
                  Dung de tham chieu, khong phai ket qua level cuoi cung.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  Ten hien thi: <span className="font-semibold text-slate-900">{profile?.displayName || user?.fullName || "N/A"}</span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  Language: <span className="font-semibold text-slate-900">{profile?.selectedLanguage?.toUpperCase() || "VI"}</span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  Tu danh gia: <span className="font-semibold text-slate-900">{profile?.selectedLevel || "A1"}</span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  Gio hoc / tuan: <span className="font-semibold text-slate-900">{profile?.weeklyHours || 0}</span>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-900">
                  Neu ban khong muon lam placement test, ban co the bo qua va vao hoc tu A1 ngay.
                </div>

                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={skipPlacementTest}
                  disabled={isSubmitting}
                >
                  Bo qua bai test va hoc tu A1
                </Button>
              </CardContent>
            </Card>

            <Card className="border-slate-200 py-5">
              <CardHeader>
                <CardTitle>{test?.title || "Chua co bai test active"}</CardTitle>
                <CardDescription>
                  {test?.instructions ||
                    "Admin can kich hoat mot placement test de user moi co the lam bai."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {!test ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-sm text-slate-600">
                    Hien tai chua co bai placement test active. Ban van co the bo qua de vao hoc tu A1.
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
                            Câu {index + 1}
                          </p>
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
                            {question.skillType} • {question.targetLevel}
                          </span>
                        </div>
                        <p className="mt-3 text-base font-semibold text-slate-950">
                          {question.prompt}
                        </p>
                        {question.instruction ? (
                          <p className="mt-2 text-sm text-slate-500">{question.instruction}</p>
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
                      disabled={isSubmitting}
                      className="h-11 w-full text-sm font-semibold"
                    >
                      {isSubmitting ? "Dang nop bai..." : "Hoan tat bai test"}
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
