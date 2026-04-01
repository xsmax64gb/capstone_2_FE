import type { AdminLearnStepAiDraft } from "@/lib/api/learnApi";

const LEARN_STEP_AI_DRAFT_STORAGE_KEY = "admin-learn-step-ai-draft";

type StoredLearnStepAiDraft = {
  mapId: string;
  draft: AdminLearnStepAiDraft;
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function saveLearnStepAiDraft(mapId: string, draft: AdminLearnStepAiDraft) {
  if (!isBrowser()) {
    return;
  }

  const payload: StoredLearnStepAiDraft = { mapId, draft };
  window.sessionStorage.setItem(
    LEARN_STEP_AI_DRAFT_STORAGE_KEY,
    JSON.stringify(payload),
  );
}

export function loadLearnStepAiDraft(mapId: string): AdminLearnStepAiDraft | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.sessionStorage.getItem(LEARN_STEP_AI_DRAFT_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredLearnStepAiDraft;

    if (parsed?.mapId !== mapId || !parsed?.draft) {
      return null;
    }

    return parsed.draft;
  } catch {
    window.sessionStorage.removeItem(LEARN_STEP_AI_DRAFT_STORAGE_KEY);
    return null;
  }
}

export function clearLearnStepAiDraft() {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.removeItem(LEARN_STEP_AI_DRAFT_STORAGE_KEY);
}
