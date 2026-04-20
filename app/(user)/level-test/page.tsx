"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowRight,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { levelApi, type TestAttempt, type TestAnswer, type TestResult } from "@/lib/level-api";
import { LevelUpModal } from "@/components/learn/level-up-modal";

type TestState = "loading" | "invitation" | "in_progress" | "submitting" | "results" | "error";

const LEVEL_TO_CEFR: Record<number, string> = {
  1: "A1",
  2: "A2",
  3: "B1",
  4: "B2",
  5: "C1",
  6: "C2",
};

export default function LevelTestPage() {
  const router = useRouter();
  const [testState, setTestState] = useState<TestState>("loading");
  const [testAttempt, setTestAttempt] = useState<TestAttempt | null>(null);
  const [answers, setAnswers] = useState<Map<string, any>>(new Map());
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);

  useEffect(() => {
    const checkTestAvailability = async () => {
      try {
        const availability = await levelApi.getTestAvailability();
        if (availability.hasTest && availability.canAttempt) {
          setTestState("invitation");
        } else {
          setErrorMessage(
            availability.hasTest
              ? "Bạn chưa đủ điều kiện để làm bài kiểm tra. Vui lòng kiếm thêm XP hoặc chờ hết thời gian chờ."
              : "Không có bài kiểm tra nào cho cấp độ tiếp theo."
          );
          setTestState("error");
        }
      } catch (error) {
        setErrorMessage("Không thể tải thông tin bài kiểm tra. Vui lòng thử lại sau.");
        setTestState("error");
      }
    };

    checkTestAvailability();
  }, []);

  useEffect(() => {
    if (testState === "in_progress" && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [testState, timeRemaining]);

  const handleStartTest = async () => {
    try {
      setTestState("loading");
      const levelInfo = await levelApi.getUserLevel();
      const attempt = await levelApi.startTest(levelInfo.currentLevel + 1);
      setTestAttempt(attempt);
      setTimeRemaining(attempt.timeLimit * 60);
      setTestState("in_progress");
    } catch (error) {
      setErrorMessage("Không thể bắt đầu bài kiểm tra. Vui lòng thử lại sau.");
      setTestState("error");
    }
  };

  const handleAnswerChange = (sectionIndex: number, questionIndex: number, value: any) => {
    const key = `${sectionIndex}-${questionIndex}`;
    setAnswers(new Map(answers.set(key, value)));
  };

  const handleAutoSubmit = useCallback(async () => {
    if (!testAttempt) return;
    await submitTest();
  }, [testAttempt, answers]);

  const submitTest = async () => {
    if (!testAttempt) return;

    try {
      setTestState("submitting");
      
      const formattedAnswers: TestAnswer[] = [];
      testAttempt.sections.forEach((section, sectionIndex) => {
        section.questions.forEach((_, questionIndex) => {
          const key = `${sectionIndex}-${questionIndex}`;
          formattedAnswers.push({
            sectionIndex,
            questionIndex,
            userAnswer: answers.get(key) || null,
          });
        });
      });

      const result = await levelApi.submitTest(testAttempt.attemptId, formattedAnswers);
      setTestResult(result);
      setTestState("results");

      if (result.levelAdvanced) {
        setTimeout(() => setShowLevelUpModal(true), 500);
      }
    } catch (error) {
      setErrorMessage("Không thể nộp bài kiểm tra. Vui lòng thử lại.");
      setTestState("error");
    }
  };

  const handleSubmitClick = () => {
    setShowSubmitConfirm(true);
  };

  const handleConfirmSubmit = () => {
    setShowSubmitConfirm(false);
    submitTest();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTotalQuestions = () => {
    if (!testAttempt) return 0;
    return testAttempt.sections.reduce((sum, section) => sum + section.questions.length, 0);
  };

  const getAnsweredQuestions = () => {
    return answers.size;
  };

  if (testState === "loading") {
    return (
      <ProtectedRoute>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-slate-400" />
            <p className="mt-4 text-slate-600">Đang tải...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (testState === "error") {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-2xl px-4 py-12">
          <Card className="border-rose-200 bg-rose-50 p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
            <h2 className="mt-4 text-xl font-semibold text-rose-900">
              Không thể tải bài kiểm tra
            </h2>
            <p className="mt-2 text-rose-700">{errorMessage}</p>
            <Button
              onClick={() => router.push("/")}
              className="mt-6"
              variant="outline"
            >
              Quay về trang chủ
            </Button>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  if (testState === "invitation") {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-2xl px-4 py-12">
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 px-8 py-12 text-center text-white">
              <Trophy className="mx-auto h-16 w-16" />
              <h1 className="mt-4 text-3xl font-bold">Bài kiểm tra cấp độ</h1>
              <p className="mt-2 text-purple-100">
                Sẵn sàng để thử thách bản thân?
              </p>
            </div>

            <div className="space-y-6 p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Thời gian</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    30 phút
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Điểm đạt</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    70%
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h3 className="font-semibold text-amber-900">Lưu ý quan trọng</h3>
                <ul className="mt-2 space-y-1 text-sm text-amber-800">
                  <li>• Bạn chỉ có một lần làm bài</li>
                  <li>• Không thể tạm dừng sau khi bắt đầu</li>
                  <li>• Bài thi sẽ tự động nộp khi hết giờ</li>
                  <li>• Cần đạt 70% để lên cấp</li>
                </ul>
              </div>

              <Button
                onClick={handleStartTest}
                className="w-full bg-purple-600 py-6 text-lg font-semibold hover:bg-purple-500"
              >
                Bắt đầu làm bài
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  if (testState === "in_progress" && testAttempt) {
    const currentSection = testAttempt.sections[currentSectionIndex];
    const progress = (getAnsweredQuestions() / getTotalQuestions()) * 100;

    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="mb-6 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <p className="text-sm text-slate-600">Tiến độ</p>
              <p className="text-lg font-semibold text-slate-900">
                {getAnsweredQuestions()} / {getTotalQuestions()} câu
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Thời gian còn lại</p>
              <p className={`text-lg font-semibold ${timeRemaining < 300 ? "text-rose-600" : "text-slate-900"}`}>
                <Clock className="mr-1 inline h-5 w-5" />
                {formatTime(timeRemaining)}
              </p>
            </div>
          </div>

          <Progress value={progress} className="mb-6 h-2" />

          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {currentSection.sectionName}
              </h2>
              <p className="text-sm text-slate-600">
                Phần {currentSectionIndex + 1} / {testAttempt.sections.length}
              </p>
            </div>

            <div className="space-y-8">
              {currentSection.questions.map((question, qIndex) => {
                const key = `${currentSectionIndex}-${qIndex}`;
                const answer = answers.get(key);

                return (
                  <div key={qIndex} className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                    <p className="mb-4 font-medium text-slate-900">
                      {qIndex + 1}. {question.questionText}
                    </p>

                    {question.questionType === "mcq" && question.options && (
                      <RadioGroup
                        value={answer}
                        onValueChange={(value) =>
                          handleAnswerChange(currentSectionIndex, qIndex, value)
                        }
                      >
                        <div className="space-y-3">
                          {question.options.map((option, oIndex) => (
                            <div
                              key={oIndex}
                              className="flex items-center space-x-3 rounded-lg border border-slate-200 bg-white p-3"
                            >
                              <RadioGroupItem
                                value={option.text}
                                id={`${key}-${oIndex}`}
                              />
                              <Label
                                htmlFor={`${key}-${oIndex}`}
                                className="flex-1 cursor-pointer"
                              >
                                {option.text}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    )}

                    {question.questionType === "fill_blank" && (
                      <Input
                        value={answer || ""}
                        onChange={(e) =>
                          handleAnswerChange(currentSectionIndex, qIndex, e.target.value)
                        }
                        placeholder="Nhập câu trả lời của bạn"
                        className="mt-2"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-between">
              <Button
                onClick={() => setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))}
                disabled={currentSectionIndex === 0}
                variant="outline"
              >
                Phần trước
              </Button>

              {currentSectionIndex < testAttempt.sections.length - 1 ? (
                <Button
                  onClick={() => setCurrentSectionIndex(currentSectionIndex + 1)}
                >
                  Phần tiếp theo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitClick}
                  className="bg-emerald-600 hover:bg-emerald-500"
                >
                  Nộp bài
                </Button>
              )}
            </div>
          </Card>
        </div>

        <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận nộp bài?</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn đã trả lời {getAnsweredQuestions()} / {getTotalQuestions()} câu hỏi.
                Bạn có chắc chắn muốn nộp bài không?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Tiếp tục làm bài</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmSubmit}>
                Nộp bài
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ProtectedRoute>
    );
  }

  if (testState === "submitting") {
    return (
      <ProtectedRoute>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-purple-600" />
            <p className="mt-4 text-slate-600">Đang chấm bài...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (testState === "results" && testResult) {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-3xl px-4 py-12">
          <Card className="overflow-hidden border-0 shadow-lg">
            <div
              className={`px-8 py-12 text-center text-white ${
                testResult.passed
                  ? "bg-gradient-to-br from-emerald-600 to-emerald-700"
                  : "bg-gradient-to-br from-rose-600 to-rose-700"
              }`}
            >
              {testResult.passed ? (
                <CheckCircle2 className="mx-auto h-16 w-16" />
              ) : (
                <XCircle className="mx-auto h-16 w-16" />
              )}
              <h1 className="mt-4 text-3xl font-bold">
                {testResult.passed ? "Chúc mừng!" : "Chưa đạt"}
              </h1>
              <p className="mt-2 text-lg">
                {testResult.passed
                  ? "Bạn đã vượt qua bài kiểm tra!"
                  : "Hãy cố gắng thêm lần sau"}
              </p>
              <div className="mt-6 text-5xl font-bold">{testResult.totalScore}%</div>
              <p className="mt-2 text-sm opacity-90">
                Điểm đạt: {testResult.passThreshold}%
              </p>
            </div>

            <div className="space-y-6 p-8">
              <div>
                <h3 className="mb-4 text-lg font-semibold text-slate-900">
                  Kết quả từng phần
                </h3>
                <div className="space-y-3">
                  {testResult.sectionScores.map((section, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900">
                          {section.sectionName}
                        </span>
                        <span className="text-lg font-bold text-slate-900">
                          {section.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={section.percentage} className="mt-2 h-2" />
                      <p className="mt-1 text-xs text-slate-600">
                        {section.score} / {section.maxScore} điểm
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {!testResult.passed && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <h3 className="font-semibold text-amber-900">Thử lại</h3>
                  <p className="mt-1 text-sm text-amber-800">
                    {testResult.nextSteps.canRetry
                      ? "Bạn có thể thử lại sau khi kiếm thêm XP và chờ hết thời gian chờ."
                      : `Bạn cần thêm ${testResult.nextSteps.xpNeededForRetry} XP để thử lại.`}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => router.push("/profile")}
                  variant="outline"
                  className="flex-1"
                >
                  Xem lịch sử
                </Button>
                <Button
                  onClick={() => router.push("/")}
                  className="flex-1 bg-purple-600 hover:bg-purple-500"
                >
                  Về trang chủ
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {testResult.levelAdvanced && testResult.newLevel && (
          <LevelUpModal
            isOpen={showLevelUpModal}
            onClose={() => setShowLevelUpModal(false)}
            newLevel={testResult.newLevel}
            newLevelName="Intermediate"
            unlockMethod="test_passed"
            testScore={testResult.totalScore}
            unlockedContent={{ exercises: 15, vocabularies: 20 }}
          />
        )}
      </ProtectedRoute>
    );
  }

  return null;
}
