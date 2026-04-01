import type { AdminPlacementTestItem } from "@/types";

const PLACEMENT_AI_DRAFT_STORAGE_KEY = "admin-placement-ai-draft";

function isBrowser() {
  return typeof window !== "undefined";
}

export function savePlacementAiDraft(draft: AdminPlacementTestItem) {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(
    PLACEMENT_AI_DRAFT_STORAGE_KEY,
    JSON.stringify(draft)
  );
}

export function loadPlacementAiDraft(): AdminPlacementTestItem | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.sessionStorage.getItem(PLACEMENT_AI_DRAFT_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AdminPlacementTestItem;
  } catch {
    window.sessionStorage.removeItem(PLACEMENT_AI_DRAFT_STORAGE_KEY);
    return null;
  }
}

export function clearPlacementAiDraft() {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.removeItem(PLACEMENT_AI_DRAFT_STORAGE_KEY);
}
