"use client";

import { useState } from "react";
import { Trophy, Zap, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface LevelProgressBarProps {
  currentLevel: number;
  currentLevelName: string;
  totalXp: number;
  currentLevelThreshold: number;
  nextLevelThreshold: number;
  progressPercentage: number;
  testAvailable: boolean;
  canAttemptTest: boolean;
}

const LEVEL_COLORS = {
  1: "bg-slate-500",
  2: "bg-emerald-500",
  3: "bg-blue-500",
  4: "bg-purple-500",
  5: "bg-amber-500",
  6: "bg-rose-500",
} as const;

const LEVEL_TO_CEFR = {
  1: "A1",
  2: "A2",
  3: "B1",
  4: "B2",
  5: "C1",
  6: "C2",
} as const;

export function LevelProgressBar({
  currentLevel,
  currentLevelName,
  totalXp,
  currentLevelThreshold,
  nextLevelThreshold,
  progressPercentage,
  testAvailable,
  canAttemptTest,
}: LevelProgressBarProps) {
  const router = useRouter();

  const levelColor = LEVEL_COLORS[currentLevel as keyof typeof LEVEL_COLORS] || "bg-slate-500";
  const cefrLevel = LEVEL_TO_CEFR[currentLevel as keyof typeof LEVEL_TO_CEFR] || "A1";
  const xpInCurrentLevel = totalXp - currentLevelThreshold;
  const xpNeededForNextLevel = nextLevelThreshold - currentLevelThreshold;

  const handleTakeTest = () => {
    router.push("/level-test");
  };

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <div className={`bg-gradient-to-br from-slate-50 to-slate-100 p-8`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-6">
            <div className={`flex h-20 w-20 items-center justify-center rounded-full ${levelColor} text-white shadow-lg`}>
              <Trophy className="h-10 w-10" />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-bold text-slate-900">
                  {cefrLevel}
                </h2>
                {testAvailable && (
                  <Badge variant="default" className="bg-amber-500 px-2 py-1 text-xs font-semibold">
                    <Zap className="mr-1 h-3 w-3" />
                    Bài kiểm tra
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-lg font-medium text-slate-600">
                {currentLevelName}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 lg:items-end">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">
                {totalXp.toLocaleString("vi-VN")}
              </span>
              <span className="text-sm font-medium text-slate-500">XP</span>
            </div>
            {currentLevel < 6 && (
              <p className="text-sm text-slate-600">
                Cần thêm{" "}
                <span className="font-semibold text-emerald-600">
                  {(nextLevelThreshold - totalXp).toLocaleString("vi-VN")} XP
                </span>
              </p>
            )}
          </div>
        </div>

        {currentLevel < 6 && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">
                Tiến độ đến {LEVEL_TO_CEFR[(currentLevel + 1) as keyof typeof LEVEL_TO_CEFR]}
              </span>
              <span className="font-semibold text-slate-900">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            
            <Progress value={progressPercentage} className="h-3" />
            
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{xpInCurrentLevel.toLocaleString("vi-VN")} XP</span>
              <span>{xpNeededForNextLevel.toLocaleString("vi-VN")} XP</span>
            </div>
          </div>
        )}

        {testAvailable && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-amber-900">
                    Bài kiểm tra cấp độ đã sẵn sàng!
                  </p>
                  <p className="mt-1 text-sm text-amber-700">
                    {canAttemptTest
                      ? "Bạn đã đủ điều kiện để làm bài kiểm tra lên cấp."
                      : "Bạn cần thêm XP hoặc chờ hết thời gian chờ để thử lại."}
                  </p>
                </div>
              </div>
              
              {canAttemptTest && (
                <Button
                  onClick={handleTakeTest}
                  className="flex-shrink-0 bg-amber-600 hover:bg-amber-500"
                >
                  Làm bài
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {currentLevel === 6 && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
            <p className="font-semibold text-emerald-900">
              🎉 Chúc mừng! Bạn đã đạt cấp độ cao nhất!
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
