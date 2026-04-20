"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatNumber, notify } from "@/lib/admin";
import { handleApiError } from "@/lib/api-error-handler";
import { API_BASE_URL } from "@/config/api";
import { tokenManager } from "@/lib/token-manager";

const LEVEL_OPTIONS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

const LEVEL_TO_NUMBER: Record<string, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
};

type Props = {
  testId?: string;
  source?: string;
};

interface Question {
  id: string;
  questionText: string;
  questionType: "mcq" | "fill_blank";
  options?: Array<{ text: string; isCorrect: boolean }>;
  correctAnswer?: string;
  points: number;
}

interface Section {
  id: string;
  sectionName: string;
  weight: number;
  questions: Question[];
}

interface LevelTestDraft {
  level: string;
  name: string;
  description: string;
  sections: Section[];
  passThreshold: number;
  timeLimit: number;
  isActive: boolean;
}

const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function createEmptyQuestion(): Question {
  return {
    id: createId("question"),
    questionText: "",
    questionType: "mcq",
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: true },
    ],
    points: 1,
  };
}

function createEmptySection(): Section {
  return {
    id: createId("section"),
    sectionName: "",
    weight: 33,
    questions: [createEmptyQuestion()],
  };
}

function createEmptyTest(): LevelTestDraft {
  return {
    level: "A1",
    name: "",
    description: "",
    sections: [createEmptySection()],
    passThreshold: 70,
    timeLimit: 30,
    isActive: false,
  };
}

const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const normalizedBase = API_BASE_URL.trim();

  if (!normalizedBase) {
    return normalizedPath;
  }

  if (/^https?:\/\//i.test(normalizedBase)) {
    return `${normalizedBase.replace(/\/$/, "")}${normalizedPath}`;
  }

  const prefixedBase = normalizedBase.startsWith("/")
    ? normalizedBase
    : `/${normalizedBase}`;

  return `${prefixedBase.replace(/\/$/, "")}${normalizedPath}`;
};

const getAuthHeaders = () => {
  const token = tokenManager.getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export function LevelTestEditorScreen({ testId, source }: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState<LevelTestDraft>(createEmptyTest());
  const [isLoading, setIsLoading] = useState(!!testId);
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState<"setup" | "sections" | "review">("setup");

  useEffect(() => {
    if (testId) {
      fetchTest();
    }
  }, [testId]);

  const fetchTest = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(buildApiUrl(`/admin/level-test/${testId}`), {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        const test = data.data.test;
        
        // Convert from backend format to draft format
        setDraft({
          level: ["A1", "A2", "B1", "B2", "C1", "C2"][test.level - 1] || "A1",
          name: test.name,
          description: test.description,
          sections: test.sections || [createEmptySection()],
          passThreshold: test.passThreshold,
          timeLimit: test.timeLimit,
          isActive: test.isActive,
        });
      }
    } catch (error) {
      notify({
        title: "Lỗi",
        message: "Không thể tải bài test.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!draft.name.trim()) {
      notify({
        title: "Thiếu thông tin",
        message: "Vui lòng nhập tên bài test.",
        type: "warning",
      });
      return;
    }

    if (draft.sections.length === 0) {
      notify({
        title: "Thiếu thông tin",
        message: "Cần ít nhất 1 phần trong bài test.",
        type: "warning",
      });
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        level: LEVEL_TO_NUMBER[draft.level],
        name: draft.name.trim(),
        description: draft.description.trim(),
        sections: draft.sections,
        passThreshold: draft.passThreshold,
        timeLimit: draft.timeLimit,
        isActive: draft.isActive,
      };

      const url = testId
        ? buildApiUrl(`/admin/level-test/${testId}`)
        : buildApiUrl("/admin/level-test/create");

      const response = await fetch(url, {
        method: testId ? "PUT" : "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        notify({
          title: testId ? "Đã cập nhật bài test" : "Đã tạo bài test",
          message: "Bài test đã được lưu thành công.",
          type: "success",
        });
        router.push("/admin/level-tests");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể lưu bài test");
      }
    } catch (error) {
      const apiError = handleApiError(error);
      notify({
        title: "Không thể lưu bài test",
        message: apiError.message,
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSection = (sectionId: string, updater: (section: Section) => Section) => {
    setDraft((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === sectionId ? updater(section) : section
      ),
    }));
  };

  const updateQuestion = (
    sectionId: string,
    questionId: string,
    updater: (question: Question) => Question
  ) => {
    updateSection(sectionId, (section) => ({
      ...section,
      questions: section.questions.map((question) =>
        question.id === questionId ? updater(question) : question
      ),
    }));
  };

  const totalQuestions = draft.sections.reduce(
    (sum, section) => sum + section.questions.length,
    0
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-600">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge
              variant="outline"
              className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500"
            >
              Level Test Editor
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              {testId ? "Chỉnh sửa bài kiểm tra" : "Tạo bài kiểm tra"}
            </h2>
          </div>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/admin/level-tests">
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </Link>
          </Button>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={step === "setup" ? "default" : "outline"}
          className="rounded-xl"
          onClick={() => setStep("setup")}
        >
          1. Setup
        </Button>
        <Button
          type="button"
          variant={step === "sections" ? "default" : "outline"}
          className="rounded-xl"
          onClick={() => setStep("sections")}
        >
          2. Sections
        </Button>
        <Button
          type="button"
          variant={step === "review" ? "default" : "outline"}
          className="rounded-xl"
          onClick={() => setStep("review")}
        >
          3. Review
        </Button>
      </div>

      <Card className="border-slate-200 py-5">
        <CardContent className="space-y-6 pt-6">
          {step === "setup" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="mb-2 block">Cấp độ CEFR</Label>
                <select
                  value={draft.level}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, level: event.target.value }))
                  }
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                >
                  {LEVEL_OPTIONS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="mb-2 block">Thời gian (phút)</Label>
                <Input
                  type="number"
                  min={5}
                  value={draft.timeLimit}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      timeLimit: Math.max(5, Number(event.target.value) || 30),
                    }))
                  }
                />
              </div>

              <div className="md:col-span-2">
                <Label className="mb-2 block">Tên bài test</Label>
                <Input
                  value={draft.name}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="VD: Kiểm tra cấp độ A2"
                />
              </div>

              <div className="md:col-span-2">
                <Label className="mb-2 block">Mô tả</Label>
                <Textarea
                  rows={3}
                  value={draft.description}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="Mô tả ngắn về bài kiểm tra"
                />
              </div>

              <div>
                <Label className="mb-2 block">Điểm đạt (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={draft.passThreshold}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      passThreshold: Math.max(0, Math.min(100, Number(event.target.value) || 70)),
                    }))
                  }
                />
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-emerald-900">Bài test active</p>
                    <p className="mt-1 text-sm text-emerald-800">
                      Học viên có thể làm bài này
                    </p>
                  </div>
                  <Switch
                    checked={draft.isActive}
                    onCheckedChange={(checked) =>
                      setDraft((current) => ({ ...current, isActive: checked }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {step === "sections" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Các phần thi</h3>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      sections: [...current.sections, createEmptySection()],
                    }))
                  }
                >
                  <Plus className="h-4 w-4" />
                  Thêm phần
                </Button>
              </div>

              {draft.sections.map((section, sectionIndex) => (
                <Card key={section.id} className="border-slate-200 shadow-none">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Phần {sectionIndex + 1}</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={draft.sections.length <= 1}
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          sections: current.sections.filter((s) => s.id !== section.id),
                        }))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="mb-2 block">Tên phần</Label>
                        <Input
                          value={section.sectionName}
                          onChange={(event) =>
                            updateSection(section.id, (s) => ({
                              ...s,
                              sectionName: event.target.value,
                            }))
                          }
                          placeholder="VD: Grammar"
                        />
                      </div>
                      <div>
                        <Label className="mb-2 block">Trọng số (%)</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={section.weight}
                          onChange={(event) =>
                            updateSection(section.id, (s) => ({
                              ...s,
                              weight: Math.max(0, Math.min(100, Number(event.target.value) || 33)),
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Câu hỏi</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateSection(section.id, (s) => ({
                              ...s,
                              questions: [...s.questions, createEmptyQuestion()],
                            }))
                          }
                        >
                          <Plus className="h-4 w-4" />
                          Thêm câu
                        </Button>
                      </div>

                      {section.questions.map((question, qIndex) => (
                        <div
                          key={question.id}
                          className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">
                              Câu {qIndex + 1}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={section.questions.length <= 1}
                              onClick={() =>
                                updateSection(section.id, (s) => ({
                                  ...s,
                                  questions: s.questions.filter((q) => q.id !== question.id),
                                }))
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <Label className="mb-2 block text-xs">Câu hỏi</Label>
                              <Textarea
                                rows={2}
                                value={question.questionText}
                                onChange={(event) =>
                                  updateQuestion(section.id, question.id, (q) => ({
                                    ...q,
                                    questionText: event.target.value,
                                  }))
                                }
                                placeholder="Nhập nội dung câu hỏi"
                              />
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                              <div>
                                <Label className="mb-2 block text-xs">Loại câu hỏi</Label>
                                <select
                                  value={question.questionType}
                                  onChange={(event) =>
                                    updateQuestion(section.id, question.id, (q) => ({
                                      ...q,
                                      questionType: event.target.value as "mcq" | "fill_blank",
                                    }))
                                  }
                                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                                >
                                  <option value="mcq">Trắc nghiệm</option>
                                  <option value="fill_blank">Điền từ</option>
                                </select>
                              </div>
                              <div>
                                <Label className="mb-2 block text-xs">Điểm</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  value={question.points}
                                  onChange={(event) =>
                                    updateQuestion(section.id, question.id, (q) => ({
                                      ...q,
                                      points: Math.max(1, Number(event.target.value) || 1),
                                    }))
                                  }
                                />
                              </div>
                            </div>

                            {question.questionType === "mcq" && (
                              <div>
                                <Label className="mb-2 block text-xs">Đáp án</Label>
                                <div className="space-y-2">
                                  {question.options?.map((option, oIndex) => (
                                    <div key={oIndex} className="flex items-center gap-2">
                                      <Input
                                        value={option.text}
                                        onChange={(event) =>
                                          updateQuestion(section.id, question.id, (q) => ({
                                            ...q,
                                            options: q.options?.map((o, i) =>
                                              i === oIndex ? { ...o, text: event.target.value } : o
                                            ),
                                          }))
                                        }
                                        placeholder={`Đáp án ${oIndex + 1}`}
                                      />
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant={option.isCorrect ? "default" : "outline"}
                                        onClick={() =>
                                          updateQuestion(section.id, question.id, (q) => ({
                                            ...q,
                                            options: q.options?.map((o, i) => ({
                                              ...o,
                                              isCorrect: i === oIndex,
                                            })),
                                          }))
                                        }
                                      >
                                        Đúng
                                      </Button>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        disabled={(question.options?.length || 0) <= 2}
                                        onClick={() =>
                                          updateQuestion(section.id, question.id, (q) => ({
                                            ...q,
                                            options: q.options?.filter((_, i) => i !== oIndex),
                                          }))
                                        }
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      updateQuestion(section.id, question.id, (q) => ({
                                        ...q,
                                        options: [
                                          ...(q.options || []),
                                          { text: "", isCorrect: false },
                                        ],
                                      }))
                                    }
                                  >
                                    <Plus className="h-3 w-3" />
                                    Thêm đáp án
                                  </Button>
                                </div>
                              </div>
                            )}

                            {question.questionType === "fill_blank" && (
                              <div>
                                <Label className="mb-2 block text-xs">Đáp án đúng</Label>
                                <Input
                                  value={question.correctAnswer || ""}
                                  onChange={(event) =>
                                    updateQuestion(section.id, question.id, (q) => ({
                                      ...q,
                                      correctAnswer: event.target.value,
                                    }))
                                  }
                                  placeholder="Nhập đáp án đúng"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {step === "review" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-slate-200 shadow-none">
                  <CardContent className="pt-6">
                    <p className="text-sm text-slate-500">Số phần</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-950">
                      {formatNumber(draft.sections.length)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-none">
                  <CardContent className="pt-6">
                    <p className="text-sm text-slate-500">Tổng câu hỏi</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-950">
                      {formatNumber(totalQuestions)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-none">
                  <CardContent className="pt-6">
                    <p className="text-sm text-slate-500">Điểm đạt</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-950">
                      {draft.passThreshold}%
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-slate-200 shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Tổng quan bài test</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-600">Cấp độ</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{draft.level}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-600">Tên bài test</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{draft.name}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-600">Thời gian</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {draft.timeLimit} phút
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-end gap-3 border-t border-slate-100">
          <Button asChild type="button" variant="outline" className="rounded-xl">
            <Link href="/admin/level-tests">Hủy</Link>
          </Button>
          {step !== "setup" && (
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() =>
                setStep((current) =>
                  current === "review" ? "sections" : "setup"
                )
              }
            >
              Quay lại
            </Button>
          )}
          {step !== "review" ? (
            <Button
              type="button"
              className="rounded-xl"
              onClick={() =>
                setStep((current) => (current === "setup" ? "sections" : "review"))
              }
            >
              Tiếp tục
            </Button>
          ) : (
            <Button
              type="button"
              className="rounded-xl"
              onClick={handleSave}
              disabled={isSaving}
            >
              <ShieldCheck className="h-4 w-4" />
              {isSaving ? "Đang lưu..." : testId ? "Lưu thay đổi" : "Tạo bài test"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
