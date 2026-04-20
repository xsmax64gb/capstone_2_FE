"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Pencil, Plus, Search, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import { AdminPageError, AdminPageLoading } from "@/components/admin/admin-query-state";
import { DeleteConfirmButton } from "@/components/admin/delete-confirm-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { handleApiError } from "@/lib/api-error-handler";
import { formatDateTime, formatNumber, notify } from "@/lib/admin";
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

const NUMBER_TO_LEVEL: Record<number, string> = {
  1: "A1",
  2: "A2",
  3: "B1",
  4: "B2",
  5: "C1",
  6: "C2",
};

interface LevelTest {
  testId: string;
  level: number;
  name: string;
  description: string;
  sectionCount: number;
  questionCount: number;
  passThreshold: number;
  timeLimit: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  statistics: {
    totalAttempts: number;
    passRate: number;
    averageScore: number;
  };
}

interface AiFormData {
  level: string;
  testName: string;
  description: string;
  numberOfQuestions: number;
  difficulty: string;
  additionalInstructions: string;
}

const INITIAL_AI_FORM: AiFormData = {
  level: "A1",
  testName: "",
  description: "",
  numberOfQuestions: 20,
  difficulty: "medium",
  additionalInstructions: "",
};

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

export default function AdminLevelTestsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiForm, setAiForm] = useState<AiFormData>(INITIAL_AI_FORM);
  const [tests, setTests] = useState<LevelTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingWithAi, setIsGeneratingWithAi] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const fetchTests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(buildApiUrl("/admin/level-test/list"), {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setTests(data.data.tests || []);
      } else {
        setError("Không tải được danh sách level tests.");
      }
    } catch (err) {
      setError("Không tải được danh sách level tests.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch tests on mount
  useEffect(() => {
    fetchTests();
  }, []);

  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return tests;
    }

    return tests.filter((item) =>
      [item.name, item.description, NUMBER_TO_LEVEL[item.level]]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [tests, query]);

  const totalQuestions = tests.reduce(
    (total, item) => total + item.questionCount,
    0
  );

  const handleDelete = async (id: string, title: string) => {
    try {
      setIsDeleting(true);
      const response = await fetch(buildApiUrl(`/admin/level-test/${id}`), {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        notify({
          title: "Đã xóa level test",
          message: `Đã xóa "${title}".`,
          type: "success",
        });
        fetchTests();
      }
    } catch (err) {
      notify({
        title: "Lỗi",
        message: "Không thể xóa bài test.",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (id: string, title: string, currentStatus: boolean) => {
    try {
      setIsToggling(true);
      const response = await fetch(
        buildApiUrl(`/admin/level-test/${id}/toggle`),
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ isActive: !currentStatus }),
        }
      );

      if (response.ok) {
        notify({
          title: currentStatus ? "Đã tắt bài test" : "Đã kích hoạt bài test",
          message: `"${title}" ${currentStatus ? "đã được tắt" : "đang hoạt động"}.`,
          type: "success",
        });
        fetchTests();
      }
    } catch (err) {
      notify({
        title: "Lỗi",
        message: "Không thể thay đổi trạng thái bài test.",
        type: "error",
      });
    } finally {
      setIsToggling(false);
    }
  };

  const handleGenerateWithAi = async () => {
    if (!aiForm.testName.trim()) {
      notify({
        title: "Thiếu thông tin",
        message: "Vui lòng nhập tên bài test.",
        type: "warning",
      });
      return;
    }

    const totalQuestions = Math.max(5, Math.min(50, Math.round(aiForm.numberOfQuestions)));

    try {
      setIsGeneratingWithAi(true);
      const response = await fetch(buildApiUrl("/admin/level-test/generate-ai"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          level: LEVEL_TO_NUMBER[aiForm.level],
          testName: aiForm.testName.trim(),
          description: aiForm.description.trim(),
          numberOfQuestions: totalQuestions,
          difficulty: aiForm.difficulty,
          additionalInstructions: aiForm.additionalInstructions.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const { testData } = data.data;

        // Create test with AI-generated data
        const createResponse = await fetch(buildApiUrl("/admin/level-test/create"), {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            level: LEVEL_TO_NUMBER[aiForm.level],
            name: testData.testName || aiForm.testName,
            description: testData.description || aiForm.description,
            sections: testData.sections,
            passThreshold: 70,
            timeLimit: 30,
            isActive: true,
          }),
        });

        if (createResponse.ok) {
          setIsAiDialogOpen(false);
          setAiForm(INITIAL_AI_FORM);
          notify({
            title: "Đã tạo bài test với AI",
            message: "Bài test đã được tạo thành công.",
            type: "success",
          });
          fetchTests();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể tạo bài test với AI");
      }
    } catch (generateError) {
      const apiError = handleApiError(generateError);
      notify({
        title: "Không thể tạo đề với AI",
        message: apiError.message,
        type: "error",
      });
    } finally {
      setIsGeneratingWithAi(false);
    }
  };

  if (isLoading) {
    return <AdminPageLoading />;
  }

  if (error) {
    return <AdminPageError message={error} />;
  }

  return (
    <>
      <div className="space-y-6">
        <section className="rounded-[30px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge
                variant="outline"
                className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500"
              >
                Level Test Admin
              </Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                Quản lý bài kiểm tra cấp độ
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                Tạo và quản lý bài kiểm tra cho từng cấp độ CEFR. Học viên cần vượt qua
                bài test để lên cấp.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setIsAiDialogOpen(true)}
              >
                <Sparkles className="h-4 w-4" />
                Tạo với AI
              </Button>
              <Button asChild className="rounded-xl">
                <Link href="/admin/level-tests/new">
                  <Plus className="h-4 w-4" />
                  Tạo thủ công
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="border-slate-200 py-5">
            <CardContent className="flex items-start justify-between gap-4 pt-1">
              <div>
                <p className="text-sm text-slate-500">Tổng bài test</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  {formatNumber(tests.length)}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 py-5">
            <CardContent className="flex items-start justify-between gap-4 pt-1">
              <div>
                <p className="text-sm text-slate-500">Bài đang active</p>
                <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  {tests.filter((t) => t.isActive).length}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Sparkles className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 py-5">
            <CardContent className="flex items-start justify-between gap-4 pt-1">
              <div>
                <p className="text-sm text-slate-500">Tổng câu hỏi</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  {formatNumber(totalQuestions)}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Plus className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="border-slate-200 py-5">
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Danh sách level tests</CardTitle>
                <CardDescription>
                  {formatNumber(filteredItems.length)} mục đang hiển thị
                </CardDescription>
              </div>
              <label className="relative w-full max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm theo tên hoặc cấp độ..."
                  className="pl-9"
                />
              </label>
            </div>
          </CardHeader>
          <CardContent>
            {filteredItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                <p className="text-lg font-semibold text-slate-900">
                  Chưa có level test phù hợp
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Tạo bài test đầu tiên để học viên có thể lên cấp.
                </p>
                <div className="mt-5 flex justify-center gap-2">
                  <Button
                    onClick={() => setIsAiDialogOpen(true)}
                    variant="outline"
                    className="rounded-xl"
                  >
                    <Sparkles className="h-4 w-4" />
                    Tạo với AI
                  </Button>
                  <Button asChild className="rounded-xl">
                    <Link href="/admin/level-tests/new">
                      <Plus className="h-4 w-4" />
                      Tạo thủ công
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[8%]">Cấp</TableHead>
                    <TableHead className="w-[28%]">Tên bài test</TableHead>
                    <TableHead className="w-[11%]">Active</TableHead>
                    <TableHead className="w-[9%]">Câu hỏi</TableHead>
                    <TableHead className="w-[9%]">Điểm đạt</TableHead>
                    <TableHead className="w-[9%]">Thời gian</TableHead>
                    <TableHead className="w-[12%]">Updated</TableHead>
                    <TableHead className="w-[14%] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.testId}>
                      <TableCell>
                        <Badge variant="outline" className="rounded-full">
                          {NUMBER_TO_LEVEL[item.level]}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top">
                        <div>
                          <p className="truncate font-medium text-slate-900">{item.name}</p>
                          <p className="mt-1 line-clamp-2 wrap-break-word text-sm text-slate-500">
                            {item.description || "Không có mô tả"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.isActive ? (
                          <Badge className="rounded-full bg-emerald-600 text-white hover:bg-emerald-600">
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="rounded-full border-slate-200 bg-slate-50 text-slate-500"
                          >
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatNumber(item.questionCount)}</TableCell>
                      <TableCell>{formatNumber(item.passThreshold)}%</TableCell>
                      <TableCell>{formatNumber(item.timeLimit)} phút</TableCell>
                      <TableCell className="text-slate-500">
                        {formatDateTime(item.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={item.isActive ? "secondary" : "outline"}
                            className="rounded-lg"
                            onClick={() => handleToggleActive(item.testId, item.name, item.isActive)}
                            disabled={isToggling}
                          >
                            {item.isActive ? "Tắt" : "Bật"}
                          </Button>
                          <Button
                            asChild
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-lg"
                          >
                            <Link href={`/admin/level-tests/${item.testId}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <DeleteConfirmButton
                            itemLabel={item.name}
                            disabled={isDeleting}
                            onConfirm={() => handleDelete(item.testId, item.name)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo level test với AI</DialogTitle>
            <DialogDescription>
              Nhập yêu cầu theo từng nhóm câu. AI sẽ tạo bài test hoàn chỉnh và lưu vào hệ thống.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="mb-2 block">Cấp độ CEFR</Label>
              <select
                value={aiForm.level}
                onChange={(event) =>
                  setAiForm((current) => ({ ...current, level: event.target.value }))
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
              <Label className="mb-2 block">Số câu hỏi</Label>
              <Input
                type="number"
                min={5}
                max={50}
                value={aiForm.numberOfQuestions}
                onChange={(event) =>
                  setAiForm((current) => ({
                    ...current,
                    numberOfQuestions: Math.max(5, Math.min(50, Number(event.target.value) || 20)),
                  }))
                }
              />
            </div>

            <div className="md:col-span-2">
              <Label className="mb-2 block">Tên bài test</Label>
              <Input
                value={aiForm.testName}
                onChange={(event) =>
                  setAiForm((current) => ({ ...current, testName: event.target.value }))
                }
                placeholder="VD: Kiểm tra cấp độ A2"
              />
            </div>

            <div className="md:col-span-2">
              <Label className="mb-2 block">Mô tả</Label>
              <Textarea
                rows={3}
                value={aiForm.description}
                onChange={(event) =>
                  setAiForm((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="Mô tả ngắn về bài kiểm tra"
              />
            </div>

            <div>
              <Label className="mb-2 block">Độ khó</Label>
              <select
                value={aiForm.difficulty}
                onChange={(event) =>
                  setAiForm((current) => ({ ...current, difficulty: event.target.value }))
                }
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="easy">Dễ</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <Label className="mb-2 block">Hướng dẫn bổ sung (tùy chọn)</Label>
              <Textarea
                rows={3}
                value={aiForm.additionalInstructions}
                onChange={(event) =>
                  setAiForm((current) => ({
                    ...current,
                    additionalInstructions: event.target.value,
                  }))
                }
                placeholder="VD: Tập trung vào thì quá khứ đơn và từ vựng về du lịch"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAiDialogOpen(false)}
              className="rounded-xl"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={() => void handleGenerateWithAi()}
              disabled={isGeneratingWithAi}
              className="rounded-xl"
            >
              {isGeneratingWithAi ? "Đang tạo..." : "Tạo với AI"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
