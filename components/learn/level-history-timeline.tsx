"use client";

import { useEffect, useState } from "react";
import { Trophy, CheckCircle, Sparkles, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { levelApi, type LevelHistoryResponse } from "@/lib/level-api";

const LEVEL_COLORS = {
  1: "bg-slate-500",
  2: "bg-emerald-500",
  3: "bg-blue-500",
  4: "bg-purple-500",
  5: "bg-amber-500",
  6: "bg-rose-500",
} as const;

const LEVEL_NAMES = {
  1: "Beginner",
  2: "Elementary",
  3: "Pre-Intermediate",
  4: "Intermediate",
  5: "Upper-Intermediate",
  6: "Advanced",
} as const;

export function LevelHistoryTimeline() {
  const [history, setHistory] = useState<LevelHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await levelApi.getLevelHistory();
        setHistory(data);
      } catch (err) {
        setError("Không thể tải lịch sử cấp độ");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </Card>
    );
  }

  if (error || !history) {
    return (
      <Card className="border-rose-200 bg-rose-50 p-6">
        <p className="text-center text-rose-700">{error || "Không có dữ liệu"}</p>
      </Card>
    );
  }

  const { history: levelHistory, statistics } = history;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Thống kê cấp độ
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">Cấp độ hiện tại</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              {statistics.currentLevel}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">Cấp đã hoàn thành</p>
            <p className="mt-1 text-3xl font-bold text-emerald-600">
              {statistics.levelsCompleted}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">Bài kiểm tra đạt</p>
            <p className="mt-1 text-3xl font-bold text-blue-600">
              {statistics.testsPassed}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">Điểm TB</p>
            <p className="mt-1 text-3xl font-bold text-purple-600">
              {statistics.averageTestScore > 0
                ? `${statistics.averageTestScore.toFixed(1)}%`
                : "N/A"}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-6 text-lg font-semibold text-slate-900">
          Lịch sử tiến độ
        </h3>

        {levelHistory.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Trophy className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4">Chưa có lịch sử cấp độ</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-6 top-0 h-full w-0.5 bg-slate-200" />

            <div className="space-y-6">
              {levelHistory.map((item, index) => {
                const levelColor =
                  LEVEL_COLORS[item.level as keyof typeof LEVEL_COLORS] ||
                  "bg-slate-500";
                const isCurrentLevel = index === 0;

                return (
                  <div key={index} className="relative flex gap-4">
                    <div className="relative z-10 flex-shrink-0">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full ${levelColor} text-white shadow-lg ${
                          isCurrentLevel ? "ring-4 ring-slate-100" : ""
                        }`}
                      >
                        <Trophy className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="flex-1 pb-6">
                      <Card
                        className={`p-4 ${
                          isCurrentLevel
                            ? "border-2 border-slate-900 bg-slate-50"
                            : "border-slate-200"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-lg font-bold text-slate-900">
                                Cấp {item.level}: {item.levelName}
                              </h4>
                              {isCurrentLevel && (
                                <Badge className="bg-emerald-500">
                                  Hiện tại
                                </Badge>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-slate-600">
                              {new Date(item.unlockedAt).toLocaleDateString(
                                "vi-VN",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          </div>

                          {item.unlockMethod === "test_passed" ? (
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-emerald-600">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                  Qua kiểm tra
                                </span>
                              </div>
                              {item.testScore !== null && (
                                <p className="mt-1 text-2xl font-bold text-slate-900">
                                  {item.testScore}%
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-amber-600">
                              <Sparkles className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                Tự động lên cấp
                              </span>
                            </div>
                          )}
                        </div>
                      </Card>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
