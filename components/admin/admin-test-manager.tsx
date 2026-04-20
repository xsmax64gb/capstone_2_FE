"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Power,
  Loader2,
  CheckCircle,
  XCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { API_BASE_URL } from "@/config/api";
import { tokenManager } from "@/lib/token-manager";

const LEVEL_TO_CEFR = {
  1: "A1",
  2: "A2",
  3: "B1",
  4: "B2",
  5: "C1",
  6: "C2",
} as const;

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
  statistics: {
    totalAttempts: number;
    passRate: number;
    averageScore: number;
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

export function AdminTestManager() {
  const [tests, setTests] = useState<LevelTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // AI Form state
  const [aiForm, setAiForm] = useState({
    level: 1,
    testName: "",
    description: "",
    numberOfQuestions: 20,
    difficulty: "medium",
    additionalInstructions: "",
  });

  useEffect(() => {
    fetchTests();
  }, [filterLevel]);

  const fetchTests = async () => {
    try {
      setIsLoading(true);
      const url =
        filterLevel === "all"
          ? buildApiUrl("/admin/level-test/list")
          : buildApiUrl(`/admin/level-test/list?level=${filterLevel}`);

      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setTests(data.data.tests);
      }
    } catch (error) {
      console.error("Failed to fetch tests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (testId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(
        buildApiUrl(`/admin/level-test/${testId}/toggle`),
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ isActive: !currentStatus }),
        }
      );

      if (response.ok) {
        fetchTests();
      }
    } catch (error) {
      console.error("Failed to toggle test:", error);
    }
  };

  const handleDelete = async (testId: string) => {
    try {
      const response = await fetch(buildApiUrl(`/admin/level-test/${testId}`), {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        fetchTests();
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Failed to delete test:", error);
    }
  };

  const handleGenerateWithAi = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch(buildApiUrl("/admin/level-test/generate-ai"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(aiForm),
      });

      if (response.ok) {
        const data = await response.json();
        const { testData } = data.data;

        // Create test with AI-generated data
        const createResponse = await fetch(buildApiUrl("/admin/level-test/create"), {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            level: aiForm.level,
            name: testData.testName || aiForm.testName,
            description: testData.description || aiForm.description,
            sections: testData.sections,
            passThreshold: 70,
            timeLimit: 30,
            isActive: true,
          }),
        });

        if (createResponse.ok) {
          fetchTests();
          setIsAiDialogOpen(false);
          setAiForm({
            level: 1,
            testName: "",
            description: "",
            numberOfQuestions: 20,
            difficulty: "medium",
            additionalInstructions: "",
          });
        }
      }
    } catch (error) {
      console.error("Failed to generate test with AI:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredTests =
    filterLevel === "all"
      ? tests
      : tests.filter((test) => test.level === parseInt(filterLevel));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Quản lý bài kiểm tra
          </h2>
          <p className="text-sm text-slate-600">
            Tạo và quản lý bài kiểm tra cấp độ
          </p>
        </div>
        <Button onClick={() => setIsAiDialogOpen(true)} className="gap-2">
          <Sparkles className="h-4 w-4" />
          Tạo bài test với AI
        </Button>
      </div>

      <div className="flex gap-4">
        <Select value={filterLevel} onValueChange={setFilterLevel}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Lọc theo cấp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả cấp độ</SelectItem>
            <SelectItem value="1">A1</SelectItem>
            <SelectItem value="2">A2</SelectItem>
            <SelectItem value="3">B1</SelectItem>
            <SelectItem value="4">B2</SelectItem>
            <SelectItem value="5">C1</SelectItem>
            <SelectItem value="6">C2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTests.map((test) => (
            <Card key={test.testId} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {LEVEL_TO_CEFR[test.level as keyof typeof LEVEL_TO_CEFR]}
                    </Badge>
                    {test.isActive ? (
                      <Badge className="bg-emerald-500">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Đang hoạt động
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="mr-1 h-3 w-3" />
                        Tạm dừng
                      </Badge>
                    )}
                  </div>
                  <h3 className="mt-2 font-semibold text-slate-900">
                    {test.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {test.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-600">Số phần</p>
                  <p className="font-semibold text-slate-900">
                    {test.sectionCount}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">Số câu hỏi</p>
                  <p className="font-semibold text-slate-900">
                    {test.questionCount}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">Thời gian</p>
                  <p className="font-semibold text-slate-900">
                    {test.timeLimit} phút
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">Điểm đạt</p>
                  <p className="font-semibold text-slate-900">
                    {test.passThreshold}%
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-600">Thống kê</p>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      {test.statistics.totalAttempts}
                    </p>
                    <p className="text-xs text-slate-600">Lượt thi</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-emerald-600">
                      {test.statistics.passRate.toFixed(0)}%
                    </p>
                    <p className="text-xs text-slate-600">Tỷ lệ đạt</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-600">
                      {test.statistics.averageScore.toFixed(0)}%
                    </p>
                    <p className="text-xs text-slate-600">Điểm TB</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleToggleActive(test.testId, test.isActive)
                  }
                >
                  <Power className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleteConfirm(test.testId)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredTests.length === 0 && !isLoading && (
        <Card className="p-12 text-center">
          <p className="text-slate-600">
            Chưa có bài kiểm tra nào cho cấp độ này
          </p>
          <Button onClick={() => setIsAiDialogOpen(true)} className="mt-4">
            <Sparkles className="mr-2 h-4 w-4" />
            Tạo bài kiểm tra với AI
          </Button>
        </Card>
      )}

      {/* AI Generation Dialog */}
      <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
        <DialogContent className="max-h-[90vh] w-[min(600px,94vw)] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Tạo bài kiểm tra với AI
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Cấp độ CEFR</Label>
                <Select
                  value={aiForm.level.toString()}
                  onValueChange={(value) =>
                    setAiForm({ ...aiForm, level: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">A1 - Beginner</SelectItem>
                    <SelectItem value="2">A2 - Elementary</SelectItem>
                    <SelectItem value="3">B1 - Pre-Intermediate</SelectItem>
                    <SelectItem value="4">B2 - Intermediate</SelectItem>
                    <SelectItem value="5">C1 - Upper-Intermediate</SelectItem>
                    <SelectItem value="6">C2 - Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Số câu hỏi</Label>
                <Input
                  type="number"
                  value={aiForm.numberOfQuestions}
                  onChange={(e) =>
                    setAiForm({
                      ...aiForm,
                      numberOfQuestions: parseInt(e.target.value),
                    })
                  }
                  min={5}
                  max={50}
                />
              </div>
            </div>

            <div>
              <Label>Tên bài kiểm tra</Label>
              <Input
                value={aiForm.testName}
                onChange={(e) =>
                  setAiForm({ ...aiForm, testName: e.target.value })
                }
                placeholder="VD: Kiểm tra cấp độ A2"
              />
            </div>

            <div>
              <Label>Mô tả</Label>
              <Textarea
                value={aiForm.description}
                onChange={(e) =>
                  setAiForm({ ...aiForm, description: e.target.value })
                }
                placeholder="Mô tả ngắn về bài kiểm tra"
                rows={3}
              />
            </div>

            <div>
              <Label>Độ khó</Label>
              <Select
                value={aiForm.difficulty}
                onValueChange={(value) =>
                  setAiForm({ ...aiForm, difficulty: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Dễ</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="hard">Khó</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Hướng dẫn bổ sung (tùy chọn)</Label>
              <Textarea
                value={aiForm.additionalInstructions}
                onChange={(e) =>
                  setAiForm({
                    ...aiForm,
                    additionalInstructions: e.target.value,
                  })
                }
                placeholder="VD: Tập trung vào thì quá khứ đơn và từ vựng về du lịch"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAiDialogOpen(false)}
              disabled={isGenerating}
            >
              Hủy
            </Button>
            <Button
              onClick={handleGenerateWithAi}
              disabled={isGenerating || !aiForm.testName}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Tạo bài test
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteConfirm !== null}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bài kiểm tra này? Hành động này không
              thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-rose-600 hover:bg-rose-500"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
