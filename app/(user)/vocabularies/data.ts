export const TOPIC_LABELS: Record<string, string> = {
  "daily-life": "Daily Life",
  work: "Work",
  travel: "Travel",
  technology: "Technology",
  general: "General",
};

export const LEVEL_LABELS: Record<string, string> = {
  A1: "A1 — Beginner",
  A2: "A2 — Elementary",
  B1: "B1 — Intermediate",
  B2: "B2 — Upper Intermediate",
  C1: "C1 — Advanced",
  C2: "C2 — Mastery",
};

export const MODE_LABELS: Record<string, string> = {
  flashcards: "Flashcards",
  quiz: "Quiz",
};

export const RESULT_LABELS: Record<string, { label: string; color: string }> = {
  "Xuất sắc!": { label: "Xuất sắc!", color: "text-emerald-600" },
  "Làm tốt!": { label: "Làm tốt!", color: "text-blue-600" },
  "Cố gắng lên!": { label: "Cố gắng lên!", color: "text-amber-600" },
  "Cần luyện thêm": { label: "Cần luyện thêm", color: "text-rose-600" },
};

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
