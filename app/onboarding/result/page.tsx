"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, GraduationCap } from "lucide-react";
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
  formatLevelLabel,
  formatSkillLabel,
  getLevelsAtOrBelow,
  loadOnboardingProfileDraft,
  loadPlacementResult,
  savePlacementResult,
  type CefrLevel,
  type PlacementResult,
} from "@/lib/mock/placement-tests";

export default function PlacementResultPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { success } = useNotification();

  const [result, setResult] = useState<PlacementResult | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<CefrLevel>("A1");

  useEffect(() => {
    const stored = loadPlacementResult();

    if (!stored || stored.skipped) {
      router.replace("/onboarding");
      return;
    }

    setResult(stored);
    setSelectedLevel((stored.confirmedLevel || stored.detectedLevel) as CefrLevel);
  }, [router]);

  const profile = loadOnboardingProfileDraft();
  const levelOptions = useMemo(
    () => (result ? getLevelsAtOrBelow(result.detectedLevel) : (["A1"] as CefrLevel[])),
    [result],
  );

  const confirmLevel = () => {
    if (!user || !result) return;

    const nextResult: PlacementResult = {
      ...result,
      confirmedLevel: selectedLevel,
    };

    savePlacementResult(nextResult);
    dispatch(
      setUser(
        buildOnboardingCompletedUser(user, {
          level: selectedLevel,
          placementScore: result.percent,
          displayName: profile?.displayName,
        }),
      ),
    );
    success(
      "Da xac nhan trinh do",
      `Ban se tiep tuc lo trinh hoc voi level ${selectedLevel}.`,
    );
    router.replace("/exercises");
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 px-4 py-10">
        <div className="mx-auto w-full max-w-5xl space-y-6">
          <section className="rounded-[30px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
            <p className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
              <GraduationCap className="mr-1.5 h-3.5 w-3.5" />
              Placement Result
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Xac nhan trinh do de bat dau hoc
            </h1>
            <p className="mt-2 max-w-3xl text-slate-600">
              He thong chi cham diem objective. Quyet dinh cuoi cung van thuoc ve ban.
            </p>
          </section>

          {!result ? (
            <Card className="border-slate-200 py-6">
              <CardContent className="text-sm text-slate-600">
                Dang tai ket qua placement...
              </CardContent>
            </Card>
          ) : (
            <section className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
              <Card className="border-slate-200 py-5">
                <CardHeader>
                  <CardTitle>Tom tat ket qua</CardTitle>
                  <CardDescription>
                    Bai test: {result.testTitle}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                    <p className="text-sm text-emerald-700">He thong dang thay ban o trinh do</p>
                    <p className="mt-2 text-4xl font-semibold tracking-tight text-emerald-950">
                      {formatLevelLabel(result.detectedLevel)}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Raw</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {result.rawScore}/{result.maxScore}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Percent</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {result.percent}%
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Self-estimate</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {profile?.selectedLevel || "A1"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <p className="text-sm font-semibold text-slate-900">
                      Ban co the:
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      tiep tuc voi level he thong de xuat, hoac chon mot level thap hon
                      neu muon hoc chac nen tang.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 py-5">
                <CardHeader>
                  <CardTitle>Chon level cuoi cung</CardTitle>
                  <CardDescription>
                    Chi cho phep chon level bang hoac thap hon muc he thong detect duoc.
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
                          <p className={`mt-2 text-xs ${selected ? "text-slate-200" : "text-slate-500"}`}>
                            {level === result.detectedLevel ? "De xuat tu he thong" : "Hoc chac hon"}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-900">Breakdown theo ky nang</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {result.skillBreakdown.map((item) => (
                        <div
                          key={item.skillType}
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-slate-700">
                              {formatSkillLabel(item.skillType)}
                            </span>
                            <span className="text-sm font-semibold text-slate-950">
                              {item.percent}%
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-500">
                            {item.earnedScore}/{item.maxScore} điểm
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={confirmLevel} className="h-11 w-full text-sm font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    Tiep tuc voi level {selectedLevel}
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
