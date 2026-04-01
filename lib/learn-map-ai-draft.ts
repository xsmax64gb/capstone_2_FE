import type { AdminLearnMapAiDraft } from "@/lib/api/learnApi";

const LEARN_MAP_AI_DRAFT_STORAGE_KEY = "admin-learn-map-ai-draft";

function isBrowser() {
  return typeof window !== "undefined";
}

export function saveLearnMapAiDraft(draft: AdminLearnMapAiDraft) {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(
    LEARN_MAP_AI_DRAFT_STORAGE_KEY,
    JSON.stringify(draft),
  );
}

export function loadLearnMapAiDraft(): AdminLearnMapAiDraft | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.sessionStorage.getItem(LEARN_MAP_AI_DRAFT_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AdminLearnMapAiDraft;
  } catch {
    window.sessionStorage.removeItem(LEARN_MAP_AI_DRAFT_STORAGE_KEY);
    return null;
  }
}

export function clearLearnMapAiDraft() {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.removeItem(LEARN_MAP_AI_DRAFT_STORAGE_KEY);
}
