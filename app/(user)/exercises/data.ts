export type ExerciseType = "mcq" | "fill_blank" | "matching";
export type ExerciseTopic = "daily-life" | "work" | "travel" | "technology";

export const TOPIC_LABELS: Record<ExerciseTopic, string> = {
  "daily-life": "Daily Life",
  work: "Work",
  travel: "Travel",
  technology: "Technology",
};

export const TYPE_LABELS: Record<ExerciseType, string> = {
  mcq: "Multiple Choice",
  fill_blank: "Fill in the Blank",
  matching: "Matching",
};

export function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
