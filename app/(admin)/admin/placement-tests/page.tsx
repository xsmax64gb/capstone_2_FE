"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
import {
  useActivateAdminPlacementTestMutation,
  useDeleteAdminPlacementTestMutation,
  useGenerateAdminPlacementTestWithAiMutation,
  useGetAdminPlacementTestsQuery,
} from "@/lib/api/placementApi";
import { handleApiError } from "@/lib/api-error-handler";
import { ADMIN_LEVEL_OPTIONS, formatDateTime, formatNumber, notify } from "@/lib/admin";
import { savePlacementAiDraft } from "@/lib/placement-ai-draft";
import type { AdminGeneratePlacementWithAiPayload } from "@/types";

const INITIAL_AI_FORM: AdminGeneratePlacementWithAiPayload = {
  title: "",
  context: "",
  levelFrom: "A1",
  levelTo: "B2",
  listeningQuestions: 4,
  readingQuestions: 6,
  grammarQuestions: 5,
  vocabQuestions: 5,
  durationMinutes: 25,
  description: "",
  instructions: "",
  isActive: false,
};

export default function AdminPlacementTestsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiForm, setAiForm] = useState<AdminGeneratePlacementWithAiPayload>(INITIAL_AI_FORM);
  const { data: items = [], isLoading, error } = useGetAdminPlacementTestsQuery();
  const [activatePlacementTest, { isLoading: isActivating }] =
    useActivateAdminPlacementTestMutation();
  const [deletePlacementTest, { isLoading: isDeleting }] =
    useDeleteAdminPlacementTestMutation();
  const [generatePlacementTestWithAi, { isLoading: isGeneratingWithAi }] =
    useGenerateAdminPlacementTestWithAiMutation();

  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return items;
    }

    return items.filter((item) =>
      [item.title, item.description, item.instructions]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [items, query]);

  const activeTest = items.find((item) => item.isActive) ?? null;
  const totalQuestions = items.reduce(
    (total, item) => total + item.activeQuestionCount,
    0
  );
  const aiQuestionTotal =
    Math.max(0, Math.round(aiForm.listeningQuestions)) +
    Math.max(0, Math.round(aiForm.readingQuestions)) +
    Math.max(0, Math.round(aiForm.grammarQuestions)) +
    Math.max(0, Math.round(aiForm.vocabQuestions));

  const handleDelete = async (id: string, title: string) => {
    await deletePlacementTest(id).unwrap();
    notify({
      title: "Đã xóa placement test",
      message: `Đã xóa "${title}".`,
      type: "success",
    });
  };

  const handleActivate = async (id: string, title: string) => {
    await activatePlacementTest(id).unwrap();
    notify({
      title: "Đã kích hoạt placement test",
      message: `"${title}" đang là bài test đầu vào cho user mới.`,
      type: "success",
    });
  };

  const handleGenerateWithAi = async () => {
    if (!aiForm.title.trim() || !aiForm.context.trim()) {
      notify({
        title: "Thiếu thông tin",
        message: "Vui lòng nhập tiêu đề và ngữ cảnh để AI tạo đề.",
        type: "warning",
      });
      return;
    }

    const levelFromIndex = ADMIN_LEVEL_OPTIONS.indexOf(aiForm.levelFrom);
    const levelToIndex = ADMIN_LEVEL_OPTIONS.indexOf(aiForm.levelTo);

    if (levelFromIndex > levelToIndex) {
      notify({
        title: "Khoảng level không hợp lệ",
        message: "Level bắt đầu cần nhỏ hơn hoặc bằng level kết thúc.",
        type: "warning",
      });
      return;
    }

    const listeningQuestions = Math.max(0, Math.round(aiForm.listeningQuestions));
    const readingQuestions = Math.max(0, Math.round(aiForm.readingQuestions));
    const grammarQuestions = Math.max(0, Math.round(aiForm.grammarQuestions));
    const vocabQuestions = Math.max(0, Math.round(aiForm.vocabQuestions));
    const totalQuestions =
      listeningQuestions + readingQuestions + grammarQuestions + vocabQuestions;

    if (totalQuestions < 5 || totalQuestions > 60) {
      notify({
        title: "Tổng số câu không hợp lệ",
        message: "Tổng số câu từ 4 nhóm cần nằm trong khoảng 5 đến 60.",
        type: "warning",
      });
      return;
    }

    try {
      const draft = await generatePlacementTestWithAi({
        ...aiForm,
        title: aiForm.title.trim(),
        context: aiForm.context.trim(),
        listeningQuestions,
        readingQuestions,
        grammarQuestions,
        vocabQuestions,
      }).unwrap();
      savePlacementAiDraft(draft);
      setIsAiDialogOpen(false);
      setAiForm(INITIAL_AI_FORM);
      notify({
        title: "Đã sinh draft placement test",
        message: "Kiểm tra lại nội dung trên form đầy đủ trước khi xác nhận tạo bài test.",
        type: "success",
      });
      router.push("/admin/placement-tests/new?source=ai");
    } catch (generateError) {
      const apiError = handleApiError(generateError);
      notify({
        title: "Không thể tạo đề với AI",
        message: apiError.message,
        type: "error",
      });
    }
  };

  if (isLoading) {
    return <AdminPageLoading />;
  }

  if (error) {
    return <AdminPageError message="Không tải được danh sách placement tests." />;
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
              Placement Admin
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Quản lý bài test đầu vào
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              Chỉ một bài được active tại một thời điểm. Người dùng mới sẽ làm đúng
              bài active đó trước khi hệ thống gợi ý level.
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
              <Link href="/admin/placement-tests/new">
                <Plus className="h-4 w-4" />
                Tạo placement test
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
                {formatNumber(items.length)}
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
              <p className="mt-2 line-clamp-2 text-xl font-semibold tracking-tight text-slate-950">
                {activeTest?.title || "Chưa có bài active"}
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
              <p className="text-sm text-slate-500">Câu hỏi active</p>
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
              <CardTitle>Danh sách placement tests</CardTitle>
              <CardDescription>
                {formatNumber(filteredItems.length)} mục đang hiển thị
              </CardDescription>
            </div>
            <label className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm theo title hoặc mô tả..."
                className="pl-9"
              />
            </label>
          </div>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
              <p className="text-lg font-semibold text-slate-900">
                Chưa có placement test phù hợp
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Tạo bài test đầu tiên để onboarding có thể gọi bài active cho user mới.
              </p>
              <Button asChild className="mt-5 rounded-xl">
                <Link href="/admin/placement-tests/new">
                  <Plus className="h-4 w-4" />
                  Tạo placement test
                </Link>
              </Button>
            </div>
          ) : (
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[34%]">Tiêu đề</TableHead>
                  <TableHead className="w-[11%]">Active</TableHead>
                  <TableHead className="w-[9%]">Câu hỏi</TableHead>
                  <TableHead className="w-[9%]">Max score</TableHead>
                  <TableHead className="w-[9%]">Duration</TableHead>
                  <TableHead className="w-[14%]">Updated</TableHead>
                  <TableHead className="w-[14%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="align-top">
                      <div>
                        <p className="truncate font-medium text-slate-900">{item.title}</p>
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
                    <TableCell>{formatNumber(item.activeQuestionCount)}</TableCell>
                    <TableCell>{formatNumber(item.maxScore)}</TableCell>
                    <TableCell>{formatNumber(item.durationMinutes)} phút</TableCell>
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
                          onClick={() => handleActivate(item.id, item.title)}
                          disabled={item.isActive || isActivating}
                        >
                          {item.isActive ? "Đang active" : "Kích hoạt"}
                        </Button>
                        <Button
                          asChild
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-lg"
                        >
                          <Link href={`/admin/placement-tests/${item.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DeleteConfirmButton
                          itemLabel={item.title}
                          disabled={isDeleting}
                          onConfirm={() => handleDelete(item.id, item.title)}
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
          <DialogTitle>Tạo placement test với AI</DialogTitle>
          <DialogDescription>
            Nhập yêu cầu theo từng nhóm câu. AI chỉ sinh draft để admin review trên form
            đầy đủ; chỉ khi xác nhận tạo thì hệ thống mới TTS câu nghe, upload
            Cloudinary và lưu DB.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label className="mb-2 block">Tiêu đề</Label>
            <Input
              value={aiForm.title}
              onChange={(event) =>
                setAiForm((current) => ({ ...current, title: event.target.value }))
              }
              placeholder="VD: Placement Test cho CSKH ngành du lịch"
            />
          </div>

          <div className="md:col-span-2">
            <Label className="mb-2 block">Ngữ cảnh tạo đề</Label>
            <Textarea
              rows={4}
              value={aiForm.context}
              onChange={(event) =>
                setAiForm((current) => ({ ...current, context: event.target.value }))
              }
              placeholder="Mô tả đối tượng học viên, ngành nghề, mục tiêu đánh giá và tình huống thực tế..."
            />
          </div>

          <div>
            <Label className="mb-2 block">Level từ</Label>
            <select
              value={aiForm.levelFrom}
              onChange={(event) =>
                setAiForm((current) => ({
                  ...current,
                  levelFrom: event.target.value as AdminGeneratePlacementWithAiPayload["levelFrom"],
                }))
              }
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
            >
              {ADMIN_LEVEL_OPTIONS.map((level) => (
                <option key={`from-${level}`} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="mb-2 block">Level đến</Label>
            <select
              value={aiForm.levelTo}
              onChange={(event) =>
                setAiForm((current) => ({
                  ...current,
                  levelTo: event.target.value as AdminGeneratePlacementWithAiPayload["levelTo"],
                }))
              }
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
            >
              {ADMIN_LEVEL_OPTIONS.map((level) => (
                <option key={`to-${level}`} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="mb-2 block">Số câu nghe</Label>
            <Input
              type="number"
              min={0}
              max={60}
              value={aiForm.listeningQuestions}
              onChange={(event) =>
                setAiForm((current) => ({
                  ...current,
                  listeningQuestions: Math.max(0, Number(event.target.value) || 0),
                }))
              }
            />
          </div>

          <div>
            <Label className="mb-2 block">Số câu đọc</Label>
            <Input
              type="number"
              min={0}
              value={aiForm.readingQuestions}
              onChange={(event) =>
                setAiForm((current) => ({
                  ...current,
                  readingQuestions: Math.max(0, Number(event.target.value) || 0),
                }))
              }
            />
          </div>

          <div>
            <Label className="mb-2 block">Số câu ngữ pháp</Label>
            <Input
              type="number"
              min={0}
              value={aiForm.grammarQuestions}
              onChange={(event) =>
                setAiForm((current) => ({
                  ...current,
                  grammarQuestions: Math.max(0, Number(event.target.value) || 0),
                }))
              }
            />
          </div>

          <div>
            <Label className="mb-2 block">Số câu từ vựng</Label>
            <Input
              type="number"
              min={0}
              value={aiForm.vocabQuestions}
              onChange={(event) =>
                setAiForm((current) => ({
                  ...current,
                  vocabQuestions: Math.max(0, Number(event.target.value) || 0),
                }))
              }
            />
          </div>

          <div>
            <Label className="mb-2 block">Thời lượng (phút)</Label>
            <Input
              type="number"
              min={5}
              value={aiForm.durationMinutes}
              onChange={(event) =>
                setAiForm((current) => ({
                  ...current,
                  durationMinutes: Number(event.target.value) || 25,
                }))
              }
            />
          </div>

          <div className="flex items-end">
            <div className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-sm font-medium text-slate-700">Đặt làm bài active</span>
              <Switch
                checked={aiForm.isActive}
                onCheckedChange={(checked) =>
                  setAiForm((current) => ({ ...current, isActive: checked }))
                }
              />
            </div>
          </div>

          <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3">
            <p className="text-sm font-medium text-slate-700">
              Tổng số câu sẽ tạo: {formatNumber(aiQuestionTotal)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Tổng từ 4 nhóm cần nằm trong khoảng 5 đến 60 câu.
            </p>
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
