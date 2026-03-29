import type { AppLang } from "@/lib/i18n/messages";
import type { OnboardingProfileDraft } from "@/types";

export type OnboardingLanguageOption = {
  id: AppLang;
  label: LocalizedText;
  description: LocalizedText;
};

export type OnboardingGoalOption = {
  id: string;
  label: LocalizedText;
};

export type OnboardingLevelOption = {
  value: string;
  label: LocalizedText;
};

export type LocalizedText = Record<AppLang, string>;

const ONBOARDING_PROFILE_STORAGE_KEY = "onboarding_profile_draft";

export const ONBOARDING_LANGUAGE_OPTIONS: OnboardingLanguageOption[] = [
  {
    id: "vi",
    label: {
      vi: "Tiếng Việt",
      en: "Vietnamese",
    },
    description: {
      vi: "Giao diện và hướng dẫn bằng tiếng Việt.",
      en: "Interface and guidance in Vietnamese.",
    },
  },
  {
    id: "en",
    label: {
      vi: "Tiếng Anh",
      en: "English",
    },
    description: {
      vi: "Giao diện và hướng dẫn bằng tiếng Anh.",
      en: "Interface and guidance in English.",
    },
  },
];

export const ONBOARDING_LEVEL_OPTIONS: OnboardingLevelOption[] = [
  {
    value: "A1",
    label: {
      vi: "A1 - Mới bắt đầu",
      en: "A1 - New starter",
    },
  },
  {
    value: "A2",
    label: {
      vi: "A2 - Giao tiếp cơ bản",
      en: "A2 - Basic communication",
    },
  },
  {
    value: "B1",
    label: {
      vi: "B1 - Tự tin giao tiếp hằng ngày",
      en: "B1 - Daily confidence",
    },
  },
  {
    value: "B2",
    label: {
      vi: "B2 - Sẵn sàng cho công việc",
      en: "B2 - Work ready",
    },
  },
  {
    value: "C1",
    label: {
      vi: "C1 - Thành thạo nâng cao",
      en: "C1 - Advanced fluency",
    },
  },
  {
    value: "C2",
    label: {
      vi: "C2 - Gần như bản ngữ",
      en: "C2 - Near-native mastery",
    },
  },
];

export const ONBOARDING_GOAL_OPTIONS: OnboardingGoalOption[] = [
  {
    id: "daily-conversation",
    label: {
      vi: "Giao tiếp hằng ngày tự nhiên hơn",
      en: "Speak more naturally in daily life",
    },
  },
  {
    id: "job-interview",
    label: {
      vi: "Tự tin phỏng vấn và làm việc",
      en: "Feel confident in interviews and at work",
    },
  },
  {
    id: "ielts",
    label: {
      vi: "Chuẩn bị IELTS / kỳ thi học thuật",
      en: "Prepare for IELTS / academic tests",
    },
  },
  {
    id: "travel",
    label: {
      vi: "Dùng tiếng Anh khi du lịch",
      en: "Use English while traveling",
    },
  },
  {
    id: "presentation",
    label: {
      vi: "Thuyết trình rõ ràng, có cấu trúc",
      en: "Present clearly with structure",
    },
  },
];

export const ONBOARDING_WEEKLY_HOURS = [2, 4, 6, 8, 10, 14];

export const ONBOARDING_TEST_PREVIEW = [
  {
    vi: "Khoảng 12-15 câu hỏi về nghe, từ vựng, ngữ pháp và phản xạ.",
    en: "Around 12-15 questions covering listening, vocabulary, grammar, and response speed.",
  },
  {
    vi: "Thời gian ước tính: 8-10 phút.",
    en: "Estimated time: 8-10 minutes.",
  },
  {
    vi: "Kết quả sẽ đề xuất level và lộ trình học phù hợp.",
    en: "The result will recommend a suitable level and learning path.",
  },
];

export function getLocalizedText(text: LocalizedText, lang: AppLang) {
  return text[lang];
}

export function getOnboardingLanguageOption(languageId?: string | null) {
  return ONBOARDING_LANGUAGE_OPTIONS.find((option) => option.id === languageId);
}

function isBrowser() {
  return typeof window !== "undefined";
}

export function saveOnboardingProfileDraft(profile: OnboardingProfileDraft) {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(
    ONBOARDING_PROFILE_STORAGE_KEY,
    JSON.stringify(profile)
  );
}

export function loadOnboardingProfileDraft(): OnboardingProfileDraft | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.sessionStorage.getItem(ONBOARDING_PROFILE_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as OnboardingProfileDraft;
  } catch {
    window.sessionStorage.removeItem(ONBOARDING_PROFILE_STORAGE_KEY);
    return null;
  }
}

export function clearOnboardingProfileDraft() {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.removeItem(ONBOARDING_PROFILE_STORAGE_KEY);
}
