"use client";

import { BookOpen, FileClock, Layers3 } from "lucide-react";
import { useGetAdminContentQuery } from "@/lib/api/adminApi";
import { formatDateTime, formatNumber } from "@/lib/admin";
import { AdminPageError, AdminPageLoading } from "@/components/admin/admin-query-state";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminContentPage() {
  const { data, isLoading, isError, error } = useGetAdminContentQuery();

  if (isLoading) {
    return <AdminPageLoading />;
  }

  if (isError || !data) {
    const message =
      typeof error === "object" && error && "status" in error
        ? `Yêu cầu thất bại (${String(error.status)}).`
        : undefined;

    return <AdminPageError message={message} />;
  }

  const metrics = [
    {
      label: "Exercise modules",
      value: formatNumber(data.summary.totalExercises),
      hint: `${formatNumber(data.summary.totalQuestions)} câu hỏi trong ngân hàng`,
      icon: BookOpen,
    },
    {
      label: "Vocabulary items",
      value: formatNumber(data.summary.totalVocabulary),
      hint: "Đọc trực tiếp từ collection vocabularies",
      icon: FileClock,
    },
    {
      label: "Loại bài tập",
      value: formatNumber(data.summary.exerciseTypeBreakdown.length),
      hint: "Phân bố theo type đang có trong hệ thống",
      icon: Layers3,
    },
  ];

  return (
    <>
      <section className="rounded-[30px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
        <Badge
          variant="outline"
          className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500"
        >
          Content Desk
        </Badge>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
          Pipeline nội dung đang lấy từ API thật.
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          Màn này đang tổng hợp exercises và vocabulary mới nhất thay cho dữ
          liệu mẫu trước đó.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label} className="border-slate-200 py-5">
              <CardContent className="flex items-start justify-between gap-4 pt-1">
                <div>
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{item.hint}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200 py-5">
          <CardHeader>
            <CardTitle>Exercises mới nhất</CardTitle>
            <CardDescription>
              Danh sách lấy từ collection `exercises`.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Câu hỏi</TableHead>
                  <TableHead>Cập nhật</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentExercises.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-slate-900">
                      {item.title}
                    </TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.level}</TableCell>
                    <TableCell>{item.topic}</TableCell>
                    <TableCell>{formatNumber(item.questionCount)}</TableCell>
                    <TableCell className="text-slate-500">
                      {formatDateTime(item.updatedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-slate-200 py-5">
          <CardHeader>
            <CardTitle>Vocabulary mới nhất</CardTitle>
            <CardDescription>
              Danh sách lấy từ collection `vocabularies`.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Từ vựng</TableHead>
                  <TableHead>Nghĩa</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Cập nhật</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentVocabulary.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-slate-900">
                      {item.word}
                    </TableCell>
                    <TableCell className="text-slate-600">{item.meaning}</TableCell>
                    <TableCell>{item.level}</TableCell>
                    <TableCell>{item.topic}</TableCell>
                    <TableCell className="text-slate-500">
                      {formatDateTime(item.updatedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-6 grid gap-3">
              {data.summary.exerciseTypeBreakdown.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <span className="text-sm text-slate-600">{item.type}</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {formatNumber(item.count)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
