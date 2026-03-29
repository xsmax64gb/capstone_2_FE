export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export const ADMIN_LEVEL_OPTIONS = ["A1", "A2", "B1", "B2", "C1", "C2"];
export const ADMIN_EXERCISE_TYPE_OPTIONS = ["mcq", "fill_blank", "matching"];
export const ADMIN_PLACEMENT_SKILL_OPTIONS = [
  "grammar",
  "vocab",
  "reading",
  "listening",
];
export const ADMIN_PLACEMENT_QUESTION_TYPE_OPTIONS = ["mcq", "true_false", "fill_blank"];

export function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export function formatPercent(value: number) {
  return `${formatNumber(value)}%`;
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatMinutes(value: number) {
  return `${formatNumber(value)} phút`;
}

export function formatUptime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours <= 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
}

export function notify(message: {
  title: string;
  type?: "success" | "error" | "warning" | "info" | "default";
  message?: string;
}) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("elapp:notify", {
      detail: {
        duration: 2500,
        ...message,
      },
    })
  );
}
