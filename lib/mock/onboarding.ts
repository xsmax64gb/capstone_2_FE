export type OnboardingLanguageOption = {
  id: string;
  label: string;
  description: string;
};

export type OnboardingGoalOption = {
  id: string;
  label: string;
};

export type OnboardingLevelOption = {
  value: string;
  label: string;
};

export const ONBOARDING_LANGUAGE_OPTIONS: OnboardingLanguageOption[] = [
  {
    id: "vi",
    label: "Tieng Viet",
    description: "Giao dien huong dan bang Tieng Viet.",
  },
  {
    id: "en",
    label: "English",
    description: "Interface guidance in English.",
  },
  {
    id: "ja",
    label: "Nihongo",
    description: "Mo ta cho nguoi hoc tieng Nhat qua English.",
  },
];

export const ONBOARDING_LEVEL_OPTIONS: OnboardingLevelOption[] = [
  { value: "A1", label: "A1 - New starter" },
  { value: "A2", label: "A2 - Basic communication" },
  { value: "B1", label: "B1 - Daily confidence" },
  { value: "B2", label: "B2 - Work ready" },
];

export const ONBOARDING_GOAL_OPTIONS: OnboardingGoalOption[] = [
  { id: "daily-conversation", label: "Giao tiep hang ngay tu nhien hon" },
  { id: "job-interview", label: "Tu tin phong van va cong viec" },
  { id: "ielts", label: "Chuan bi IELTS / test hoc thuat" },
  { id: "travel", label: "Dung tieng Anh khi du lich" },
  { id: "presentation", label: "Thuyet trinh ro rang, co cau truc" },
];

export const ONBOARDING_WEEKLY_HOURS = [2, 4, 6, 8, 10, 14];

export const ONBOARDING_TEST_PREVIEW = [
  "Khoang 12-15 cau hoi nghe, tu vung, ngu phap va phan xa.",
  "Thoi gian uoc tinh: 8-10 phut.",
  "Ket qua se de xuat level va lo trinh hoc phu hop.",
];
