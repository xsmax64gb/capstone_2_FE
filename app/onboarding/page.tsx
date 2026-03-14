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
import { useDispatch } from "react-redux";
import { ProtectedRoute } from "@/components/auth/protected-route";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { setUser } from "@/lib/slices/authSlice";
import { useNotification } from "@/hooks/use-notification";
import { useAuth } from "@/lib/auth-context";
import {
  ONBOARDING_GOAL_OPTIONS,
  ONBOARDING_LANGUAGE_OPTIONS,
  ONBOARDING_LEVEL_OPTIONS,
  ONBOARDING_TEST_PREVIEW,
  ONBOARDING_WEEKLY_HOURS,
} from "@/lib/mock/onboarding";

type Step = 0 | 1 | 2;

export default function OnboardingPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { success, info } = useNotification();

  const [step, setStep] = useState<Step>(0);
  const [isStartingTest, setIsStartingTest] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState("vi");
  const [selectedLevel, setSelectedLevel] = useState("A1");
  const [weeklyHours, setWeeklyHours] = useState(4);
  const [displayName, setDisplayName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  useEffect(() => {
    if (user?.onboardingDone) {
      router.replace("/dashboard");
    }
  }, [router, user?.onboardingDone]);

  useEffect(() => {
    if (user?.fullName) {
      setDisplayName(user.fullName);
    }
  }, [user?.fullName]);

  const progressPercent = useMemo(() => ((step + 1) / 3) * 100, [step]);

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

  const startPlacementTest = async () => {
    if (!user) return;

    setIsStartingTest(true);

    const mockPayload = {
      selectedLanguage,
      selectedLevel,
      weeklyHours,
      displayName,
      jobTitle,
      selectedGoals,
      startedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(
        "mock_onboarding_profile",
        JSON.stringify(mockPayload),
      );

      dispatch(
        setUser({
          ...user,
          fullName: displayName.trim() || user.fullName,
          name: displayName.trim() || user.name,
          currentLevel: selectedLevel,
          onboardingDone: true,
        }),
      );

      success(
        "Onboarding hoan tat",
        "Ban da san sang de bat dau bai test dau vao.",
      );
      info("Mock mode", "Dang dung du lieu mock. Co the noi API that sau.");

      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
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
              New Learner Setup
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Chao mung ban den voi lo trinh hoc ca nhan hoa
            </h1>
            <p className="mt-2 text-slate-600">
              Chi can 3 buoc ngan de he thong de xuat bai test dau vao phu hop
              voi muc tieu cua ban.
            </p>
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
                  Chon ngon ngu uu tien
                </CardTitle>
                <CardDescription>
                  Ban co the doi lai bat cu luc nao trong cai dat.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                  {ONBOARDING_LANGUAGE_OPTIONS.map((option) => {
                    const selected = option.id === selectedLanguage;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setSelectedLanguage(option.id)}
                        className={`rounded-xl border p-4 text-left transition-all ${
                          selected
                            ? "border-black bg-black text-white shadow-lg"
                            : "border-slate-200 bg-white text-slate-800 hover:border-slate-400"
                        }`}
                      >
                        <p className="font-semibold">{option.label}</p>
                        <p
                          className={`mt-1 text-sm ${selected ? "text-slate-200" : "text-slate-500"}`}
                        >
                          {option.description}
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
                <CardTitle className="text-2xl">
                  Thong tin hoc tap co ban
                </CardTitle>
                <CardDescription>
                  Du lieu nay dang la mock data de mo phong onboarding flow.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">
                      Ten hien thi
                    </span>
                    <input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Nhap ten ban muon hien thi"
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-black"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">
                      Nghe nghiep (tuy chon)
                    </span>
                    <input
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="VD: Software Engineer"
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-black"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">
                      Uoc tinh trinh do hien tai
                    </span>
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-black"
                    >
                      {ONBOARDING_LEVEL_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">
                      So gio hoc moi tuan
                    </span>
                    <select
                      value={weeklyHours}
                      onChange={(e) => setWeeklyHours(Number(e.target.value))}
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-black"
                    >
                      {ONBOARDING_WEEKLY_HOURS.map((hour) => (
                        <option key={hour} value={hour}>
                          {hour} gio / tuan
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700">
                    Muc tieu uu tien
                  </p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {ONBOARDING_GOAL_OPTIONS.map((goal) => {
                      const selected = selectedGoals.includes(goal.id);
                      return (
                        <button
                          key={goal.id}
                          onClick={() => toggleGoal(goal.id)}
                          className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                            selected
                              ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {goal.label}
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
                  San sang bat dau bai test dau vao
                </CardTitle>
                <CardDescription>
                  He thong da tong hop profile hoc tap mock cua ban.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">
                    Tom tat nhanh
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-600">
                    <li>Ten hien thi: {displayName || "(chua nhap)"}</li>
                    <li>
                      Ngon ngu huong dan: {selectedLanguage.toUpperCase()}
                    </li>
                    <li>Level du kien: {selectedLevel}</li>
                    <li>Lich hoc: {weeklyHours} gio/ tuan</li>
                    <li>Muc tieu: {selectedGoals.length} lua chon</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-900">
                    Bai test se bao gom
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-emerald-800">
                    {ONBOARDING_TEST_PREVIEW.map((item) => (
                      <li key={item} className="inline-flex items-center">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={startPlacementTest}
                  disabled={isStartingTest}
                  className="h-11 w-full text-sm font-semibold"
                >
                  {isStartingTest
                    ? "Dang khoi tao bai test..."
                    : "Bat dau bai test dau vao"}
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 0 || isStartingTest}
              className="min-w-[120px]"
            >
              <ChevronLeft className="mr-1.5 h-4 w-4" />
              Quay lai
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
                Tiep tuc
                <ChevronRight className="ml-1.5 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
