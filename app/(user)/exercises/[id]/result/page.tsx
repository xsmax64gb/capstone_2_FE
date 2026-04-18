"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  RotateCcw,
  Target,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ResultSkeleton } from "@/components/exercises/skeletons";
import { useGetExerciseByIdQuery } from "@/store/services/exercisesApi";

function toInt(value: string | null, fallback: number) {
  const num = Number.parseInt(value ?? "", 10);
  return Number.isFinite(num) ? num : fallback;
}

function parseAnswers(raw: string) {
  if (!raw.trim()) return null;
  const parsed = raw.split(",").map((item) => Number.parseInt(item, 10));
  if (parsed.some((item) => !Number.isFinite(item) || item < -1)) return null;
  return parsed;
}

const RESULT_CONFIG: Record<
  string,
  {
    label: string;
    badgeClassName: string;
    scoreClassName: string;
    summary: string;
    recommendation: string;
  }
> = {
  Excellent: {
    label: "Xuất sắc",
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
    scoreClassName: "text-emerald-600",
    summary: "Bạn làm rất chắc tay và giữ độ chính xác cao ở hầu hết câu hỏi.",
    recommendation: "Có thể chuyển sang bài khó hơn hoặc mở phần xem đáp án để củng cố lần cuối.",
  },
  "Good Progress": {
    label: "Kết quả tốt",
    badgeClassName: "border-sky-200 bg-sky-50 text-sky-700",
    scoreClassName: "text-sky-600",
    summary: "Bạn đã nắm được phần lớn nội dung và chỉ còn vài điểm cần rà lại.",
    recommendation: "Xem nhanh các câu sai để khóa lại kiến thức trước khi chuyển bài tiếp theo.",
  },
  "Keep Going": {
    label: "Đạt một phần",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
    scoreClassName: "text-amber-600",
    summary: "Bạn đã có nền tảng, nhưng vẫn còn khá nhiều câu cần xem lại kỹ hơn.",
    recommendation: "Nên đọc giải thích từng câu và thử làm lại ngay khi nội dung còn mới.",
  },
  "Needs Retry": {
    label: "Cần làm lại",
    badgeClassName: "border-rose-200 bg-rose-50 text-rose-700",
    scoreClassName: "text-rose-600",
    summary: "Kết quả hiện tại cho thấy bạn cần thêm một lượt ôn tập trước khi chuyển sang bài khác.",
    recommendation: "Ưu tiên xem phần giải thích và làm lại bài để sửa ngay các lỗi vừa gặp.",
  },
};

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

export default function ExerciseResultPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = params?.id ?? "";

  const { data, isLoading, isError } = useGetExerciseByIdQuery(id, { skip: !id });
  const exercise = data?.exercise;

  const scoreParam = searchParams.get("score");
  const totalParam = searchParams.get("total");
  const timeParam = searchParams.get("time");
  const answersParam = searchParams.get("answers") ?? "";

  const score = toInt(scoreParam, -1);
  const total = toInt(totalParam, -1);
  const time = toInt(timeParam, -1);
  const parsedAnswers = parseAnswers(answersParam);

  const hasValidPayload =
    scoreParam !== null &&
    totalParam !== null &&
    timeParam !== null &&
    score >= 0 &&
    total > 0 &&
    score <= total &&
    time >= 0 &&
    parsedAnswers !== null &&
    parsedAnswers.length === total;

  const percent = Math.max(0, Math.min(100, Math.round((score / Math.max(total, 1)) * 100)));
  const earnedXp = Math.round((percent / 100) * (exercise?.rewardsXp ?? 0));
  const unansweredCount = parsedAnswers?.filter((item) => item === -1).length ?? 0;
  const answeredCount = Math.max(0, total - unansweredCount);
  const wrongCount = Math.max(0, total - score - unansweredCount);

  const resultKey =
    percent >= 85
      ? "Excellent"
      : percent >= 70
        ? "Good Progress"
        : percent >= 50
          ? "Keep Going"
          : "Needs Retry";

  const resultCfg = RESULT_CONFIG[resultKey] ?? RESULT_CONFIG["Keep Going"]!;

  const reviewHref = `/exercises/${id}/result/review?score=${score}&total=${total}&answers=${encodeURIComponent(answersParam)}&time=${time}`;
  const retryHref = `/exercises/${id}/attempt`;
  const leaderboardHref = `/exercises/${id}/leaderboard`;

  const stats = [
    {
      label: "Câu đúng",
      value: `${score}`,
      hint: `${percent}% độ chính xác`,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Câu sai",
      value: `${wrongCount}`,
      hint: "Cần xem lại",
      icon: XCircle,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      label: "Chưa trả lời",
      value: `${unansweredCount}`,
      hint: `${answeredCount}/${total} câu đã làm`,
      icon: Target,
      color: "text-slate-600",
      bg: "bg-slate-100",
    },
    {
      label: "Thời gian làm",
      value: formatDuration(time),
      hint: "Tổng thời gian nộp bài",
      icon: Clock3,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "XP nhận được",
      value: `+${earnedXp}`,
      hint: `${exercise?.rewardsXp ?? 0} XP tối đa`,
      icon: Zap,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        {/* Back */}
        <nav className="mb-6">
          <Link
            href={exercise ? `/exercises/${exercise.id}` : "/exercises"}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại bài tập
          </Link>
        </nav>

        {isLoading && <ResultSkeleton />}

        {isError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            Không tải được thông tin bài tập.
          </div>
        )}

        {/* Invalid payload warning */}
        {!isLoading && !isError && !hasValidPayload && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <p className="inline-flex items-center gap-2 text-sm font-bold text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              Không có kết quả hợp lệ
            </p>
            <p className="mt-2 text-sm text-amber-700">
              Hãy hoàn thành một lượt làm bài trước để xem kết quả.
            </p>
            {exercise && (
              <Link
                href={`/exercises/${exercise.id}/attempt`}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700"
              >
                <RotateCcw className="h-4 w-4" />
                Làm bài ngay
              </Link>
            )}
          </div>
        )}

        {hasValidPayload && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Kết quả bài tập
                  </p>
                  <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Bạn đã hoàn thành bài tập
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {exercise?.title ? (
                      <>
                        Bài tập{" "}
                        <span className="font-semibold text-slate-700">{exercise.title}</span> đã
                        được chấm điểm. Bạn có thể xem nhanh phần tóm tắt bên dưới trước khi
                        quyết định làm lại hay xem đáp án.
                      </>
                    ) : (
                      "Kết quả lượt làm đã sẵn sàng. Bạn có thể xem nhanh phần tóm tắt bên dưới trước khi tiếp tục."
                    )}
                  </p>

                  <div className="mt-4 inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold shadow-sm">
                    <span className={`rounded-full border px-3 py-1 ${resultCfg.badgeClassName}`}>
                      {resultCfg.label}
                    </span>
                  </div>

                  <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                    {resultCfg.summary}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 lg:w-[300px]">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Tổng điểm
                  </p>
                  <p className={`mt-2 text-4xl font-bold tracking-tight ${resultCfg.scoreClassName}`}>
                    {percent}%
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {score}/{total} câu đúng
                  </p>

                  <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">Câu đã trả lời</span>
                      <span className="font-semibold text-slate-900">
                        {answeredCount}/{total}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">Thời gian làm</span>
                      <span className="font-semibold text-slate-900">{formatDuration(time)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">XP nhận được</span>
                      <span className="font-semibold text-slate-900">+{earnedXp}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              {stats.map(({ icon: Icon, label, value, hint, color, bg }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className={`inline-flex rounded-xl p-2 ${bg}`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    {label}
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p>
                </div>
              ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900">Đánh giá kết quả</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {resultCfg.summary} {resultCfg.recommendation}
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Mức độ hoàn thành
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {answeredCount === total
                          ? "Bạn đã trả lời toàn bộ câu hỏi."
                          : `Bạn bỏ trống ${unansweredCount} câu trong lượt làm này.`}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Điểm cần xem lại
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {wrongCount > 0
                          ? `${wrongCount} câu trả lời sai cần đọc lại phần giải thích.`
                          : "Bạn không có câu sai trong lượt làm này."}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900">Gợi ý bước tiếp theo</h2>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900">
                        1. Xem lại đáp án và giải thích
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Đây là cách nhanh nhất để biết mình sai ở đâu và vì sao đáp án đúng lại hợp lý.
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900">2. Làm lại bài nếu cần</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Sau khi xem giải thích, làm lại ngay sẽ giúp bạn kiểm tra xem lỗi đã được sửa chưa.
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900">3. So sánh với người khác</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Nếu muốn theo dõi vị trí của mình, hãy mở bảng xếp hạng của bài này.
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              <aside className="space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900">Tiếp tục</h2>
                  <div className="mt-4 space-y-3">
                    <Link
                      href={reviewHref}
                      className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                    >
                      <BookOpen className="h-4 w-4" />
                      Xem đáp án & giải thích
                    </Link>
                    <Link
                      href={retryHref}
                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Làm lại bài
                    </Link>
                    <Link
                      href={leaderboardHref}
                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Trophy className="h-4 w-4" />
                      Xem bảng xếp hạng
                    </Link>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900">Thông tin bài làm</h2>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
                      <span className="text-slate-500">Tổng số câu</span>
                      <span className="font-semibold text-slate-900">{total} câu</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
                      <span className="text-slate-500">Thời gian làm</span>
                      <span className="font-semibold text-slate-900">{formatDuration(time)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
                      <span className="text-slate-500">XP nhận được</span>
                      <span className="font-semibold text-slate-900">+{earnedXp}</span>
                    </div>
                    {exercise ? (
                      <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
                        <span className="text-slate-500">Bài tập</span>
                        <span className="text-right font-semibold text-slate-900">
                          {exercise.title}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </section>
              </aside>
            </section>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
