"use client";

import { useEffect } from "react";
import { Trophy, Sparkles, BookOpen, MessageSquare } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  newLevelName: string;
  unlockMethod: "test_passed" | "auto_advanced";
  testScore?: number;
  unlockedContent: {
    exercises: number;
    vocabularies: number;
  };
}

const LEVEL_COLORS = {
  1: "from-slate-500 to-slate-600",
  2: "from-emerald-500 to-emerald-600",
  3: "from-blue-500 to-blue-600",
  4: "from-purple-500 to-purple-600",
  5: "from-amber-500 to-amber-600",
  6: "from-rose-500 to-rose-600",
} as const;

export function LevelUpModal({
  isOpen,
  onClose,
  newLevel,
  newLevelName,
  unlockMethod,
  testScore,
  unlockedContent,
}: LevelUpModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      // Trigger confetti animation
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        // Check if confetti is available
        if (typeof window !== "undefined" && (window as any).confetti) {
          (window as any).confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          });
          (window as any).confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          });
        }
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const levelGradient = LEVEL_COLORS[newLevel as keyof typeof LEVEL_COLORS] || "from-slate-500 to-slate-600";

  const handleExploreContent = () => {
    onClose();
    router.push("/exercises");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[min(520px,94vw)] overflow-hidden border-0 p-0 sm:max-w-[520px]">
        <div className={`bg-gradient-to-br ${levelGradient} px-6 py-8 text-white`}>
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-white opacity-20" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Trophy className="h-12 w-12" />
              </div>
            </div>

            <h2 className="mt-6 text-3xl font-bold">Chúc mừng!</h2>
            <p className="mt-2 text-lg font-medium text-white/90">
              Bạn đã lên cấp {newLevel}
            </p>
            <p className="mt-1 text-2xl font-bold">{newLevelName}</p>

            {unlockMethod === "test_passed" && testScore !== undefined && (
              <div className="mt-4 rounded-xl bg-white/20 px-4 py-2 backdrop-blur-sm">
                <p className="text-sm font-medium text-white/80">
                  Điểm kiểm tra
                </p>
                <p className="text-3xl font-bold">{testScore}%</p>
              </div>
            )}

            {unlockMethod === "auto_advanced" && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 backdrop-blur-sm">
                <Sparkles className="h-5 w-5" />
                <p className="text-sm font-medium">Tự động lên cấp</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Nội dung mới đã mở khóa
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Bạn có thể truy cập thêm nhiều tài liệu học tập mới
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Bài tập
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    +{unlockedContent.exercises}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Từ vựng
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    +{unlockedContent.vocabularies}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Đóng
            </Button>
            <Button
              onClick={handleExploreContent}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
            >
              Khám phá nội dung
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
