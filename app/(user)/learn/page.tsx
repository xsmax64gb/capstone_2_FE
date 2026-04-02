"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  Check,
  Lock,
  Map as MapIcon,
  Play,
  Sparkles,
} from "lucide-react";
import {
  LearnPathOverlay,
  LEARN_NODE_COL_CLASS,
  LEARN_PATH_TRACK_CLASS,
} from "@/components/learn/zigzag-connector";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import {
  useGetLearnMapsQuery,
  type LearnMapItem,
  type MapProgressStatus,
} from "@/lib/api/learnApi";

type NodeVisualStatus = "completed" | "current" | "locked";

function toVisualStatus(
  status: MapProgressStatus | undefined,
): NodeVisualStatus {
  if (status === "completed") return "completed";
  if (status === "active") return "current";
  return "locked";
}

function stageBadge(status: NodeVisualStatus) {
  if (status === "completed") return "HOÀN THÀNH";
  if (status === "current") return "ĐANG HỌC";
  return "KHÓA";
}

function MapStageNode({
  map,
  side,
  visual,
  emphasizeFloat,
  anchorRef,
}: {
  map: LearnMapItem;
  side: "left" | "right";
  visual: NodeVisualStatus;
  emphasizeFloat: boolean;
  anchorRef: ((node: HTMLDivElement | null) => void) | undefined;
}) {
  const isLocked = visual === "locked";
  const isCurrent = visual === "current";
  const isCompleted = visual === "completed";
  const floatClass = isCurrent && emphasizeFloat ? "animate-float" : "";

  const xpDisplay =
    map.requiredXPToComplete > 0
      ? map.requiredXPToComplete
      : map.totalXP > 0
        ? map.totalXP
        : Math.max(10, map.bossXPReward || 0) + 15;

  const subtitle =
    map.theme ||
    (map.description
      ? map.description.length > 88
        ? `${map.description.slice(0, 88)}…`
        : map.description
      : "Hội thoại AI theo chủ đề");

  const card = (
    <div
      className={`ai-node-card group inline-flex w-full max-w-[13rem] flex-col items-center rounded-2xl border border-transparent px-2 py-2 transition-all duration-300 ${
        isLocked
          ? "cursor-not-allowed opacity-80"
          : "cursor-pointer hover:-translate-y-1 hover:scale-[1.02] hover:border-slate-200 hover:bg-white hover:shadow-xl"
      }`}
    >
      <div
        ref={anchorRef}
        className={`ai-node-glow relative flex h-16 w-16 items-center justify-center rounded-full border text-white shadow-xl transition-transform duration-500 ${
          isCompleted
            ? "border-black bg-black"
            : isCurrent
              ? "border-black bg-white text-black"
              : "border-slate-200 bg-slate-100 text-slate-400"
        } ${floatClass} ${!isLocked ? "group-hover:scale-110" : ""}`}
      >
        {isCompleted && <Check className="h-6 w-6" strokeWidth={2.5} />}
        {isCurrent && <Play className="h-6 w-6 fill-current" />}
        {isLocked && <Lock className="h-5 w-5" />}
      </div>

      <h3 className="mt-3 text-center text-base font-bold tracking-tight text-slate-900">
        {map.title}
      </h3>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
        Level {map.level}
      </p>
      <p className="mt-1 line-clamp-2 min-h-9 text-center text-xs text-slate-500">
        {subtitle}
      </p>
      <p
        className={`mt-1 text-[11px] font-bold ${
          isCompleted
            ? "text-emerald-600"
            : isCurrent
              ? "text-amber-600"
              : "text-slate-400"
        }`}
      >
        {stageBadge(visual)}
      </p>
      <p className="text-[10px] font-semibold text-slate-400">
        ~{xpDisplay} XP
      </p>
      {map.progress ? (
        <p className="mt-1 text-[10px] text-slate-400">
          {Math.min(map.progress.totalXPEarned || 0, xpDisplay)} / {xpDisplay}{" "}
          XP
        </p>
      ) : null}

      <div className="mt-3">
        {isLocked ? (
          <span className="inline-flex rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-400">
            Khóa
          </span>
        ) : (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${
              isCurrent
                ? "bg-black text-white group-hover:bg-slate-800"
                : "border border-slate-200 text-slate-700 group-hover:bg-slate-50"
            }`}
          >
            {isCurrent ? "Tiếp tục" : "Ôn lại"}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`flex w-full ${side === "left" ? "justify-start" : "justify-end"}`}
    >
      <div className={LEARN_NODE_COL_CLASS}>
        {isLocked ? (
          <div className="select-none">{card}</div>
        ) : (
          <Link href={`/learn/${map.slug}`} className="block w-full">
            {card}
          </Link>
        )}
      </div>
    </div>
  );
}

export default function LearnMapsPage() {
  const { data, isLoading, error } = useGetLearnMapsQuery();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const anchorRefs = useRef<Array<HTMLDivElement | null>>([]);
  const items: LearnMapItem[] = data?.items ?? [];
  anchorRefs.current.length = items.length;
  const primaryActiveIndex = items.findIndex(
    (m) => m.progress?.status === "active",
  );

  return (
    <ProtectedRoute>
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <section
          className="min-w-0 flex-1 overflow-y-auto px-5 py-10 md:px-8 md:py-12"
          style={{ height: "calc(100vh - 64px)" }}
        >
          <ScrollReveal>
            <header className="mx-auto max-w-2xl text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                AI Speaking Map
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Lộ trình hội thoại
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
                Mỗi nút là một <strong>bản đồ học</strong>. Hoàn thành bài trong
                map và đánh bại boss để mở bản đồ tiếp theo. Tiếp tục để vào hội
                thoại AI.
              </p>
            </header>
          </ScrollReveal>

          <div
            ref={trackRef}
            className={`relative isolate mt-10 md:mt-14 ${LEARN_PATH_TRACK_CLASS}`}
          >
            <LearnPathOverlay
              containerRef={trackRef}
              anchorRefs={anchorRefs}
              anchorCount={items.length}
            />
            {isLoading && (
              <p className="text-center text-sm text-slate-500">
                Đang tải bản đồ…
              </p>
            )}
            {error && (
              <p className="text-center text-sm text-red-600">
                Không tải được dữ liệu. Kiểm tra mạng hoặc đăng nhập lại.
              </p>
            )}
            {!isLoading && items.length === 0 && !error && (
              <p className="text-center text-sm text-slate-500">
                Chưa có bản đồ nào được xuất bản. Hãy chạy seed hoặc tạo map
                trong admin.
              </p>
            )}

            {items.map((map, index) => {
              const side: "left" | "right" = index % 2 === 0 ? "left" : "right";
              const visual = toVisualStatus(map.progress?.status);
              const emphasizeFloat =
                visual === "current" && index === primaryActiveIndex;

              return (
                <div key={map.id}>
                  <ScrollReveal delay={80 + index * 100}>
                    <MapStageNode
                      map={map}
                      side={side}
                      visual={visual}
                      emphasizeFloat={emphasizeFloat}
                      anchorRef={(node) => {
                        anchorRefs.current[index] = node;
                      }}
                    />
                  </ScrollReveal>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="hidden w-72 shrink-0 flex-col gap-6 border-l border-slate-200/80 bg-white/90 p-6 backdrop-blur xl:flex">
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              Gợi ý
            </h3>
            <div className="flex flex-col gap-3 text-sm text-slate-600">
              <div className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                <MapIcon className="mt-0.5 h-5 w-5 shrink-0 text-slate-700" />
                <p>
                  Bản đồ <strong>khóa</strong> sẽ mở khi bạn hoàn thành map
                  trước hoặc thắng boss.
                </p>
              </div>
              <div className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-slate-700" />
                <p>
                  Vào từng map để xem <strong>các bước</strong> (lesson / boss)
                  và bắt đầu hội thoại.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 text-xs font-semibold text-slate-500">
              Mục tiêu
            </p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-black transition-all"
                style={{
                  width: `${items.length ? Math.round((items.filter((m) => m.progress?.status === "completed").length / items.length) * 100) : 0}%`,
                }}
              />
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              {items.filter((m) => m.progress?.status === "completed").length} /{" "}
              {items.length} bản đồ hoàn thành
            </p>
          </div>
        </aside>
      </main>
    </ProtectedRoute>
  );
}
