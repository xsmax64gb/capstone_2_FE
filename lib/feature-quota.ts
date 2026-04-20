import type { FeatureQuotaItem, FeatureQuotaOverviewResponse } from "@/types";

export const AI_EXERCISE_BUILDER_FEATURE_KEY = "ai_exercise_builder";
export const AI_VOCABULARY_BUILDER_FEATURE_KEY = "ai_vocabulary_builder";
export const AI_CREATOR_FEATURE_KEYS = [
  AI_EXERCISE_BUILDER_FEATURE_KEY,
  AI_VOCABULARY_BUILDER_FEATURE_KEY,
] as const;

const QUOTA_PERIOD_LABELS = {
  day: "ngày",
  week: "tuần",
  month: "tháng",
  billing_cycle: "chu kỳ gói",
  lifetime: "trọn đời",
} as const;

export const getFeatureQuotaItem = (
  overview: FeatureQuotaOverviewResponse | undefined,
  featureKey: string,
) =>
  overview?.features.find((feature) => feature.featureKey === featureKey) ??
  null;

export const isFeatureQuotaBlocked = (
  feature: FeatureQuotaItem | null | undefined,
) => Boolean(feature && (!feature.enabled || feature.isBlocked));

export const getFeatureQuotaPeriodLabel = (
  feature: FeatureQuotaItem | null | undefined,
) => {
  if (!feature?.quotaPeriod) {
    return "không kỳ hạn";
  }

  return QUOTA_PERIOD_LABELS[feature.quotaPeriod] ?? "không kỳ hạn";
};

export const getFeatureQuotaBadgeText = (
  feature: FeatureQuotaItem | null | undefined,
) => {
  if (!feature) {
    return "Đang kiểm tra";
  }

  if (!feature.enabled) {
    return "Chưa mở";
  }

  if (feature.isUnlimited || feature.quota === null) {
    return "Không giới hạn";
  }

  if (typeof feature.remaining !== "number") {
    return "Đang cập nhật";
  }

  if (feature.isBlocked || feature.remaining <= 0) {
    return "Hết quota";
  }

  return `Còn ${Math.max(0, feature.remaining)} lượt`;
};

export const getFeatureQuotaBlockedMessage = (
  feature: FeatureQuotaItem | null | undefined,
  featureLabel: string,
) => {
  if (!feature) {
    return `${featureLabel} hiện chưa sẵn sàng. Vui lòng thử lại sau.`;
  }

  if (!feature.enabled) {
    return `${featureLabel} chưa được mở trong gói hiện tại. Vào trang thanh toán để nâng cấp gói.`;
  }

  if (feature.isUnlimited || feature.quota === null) {
    return `${featureLabel} hiện đang không giới hạn lượt sử dụng.`;
  }

  const quotaPeriodLabel = getFeatureQuotaPeriodLabel(feature);
  const used = typeof feature.used === "number" ? feature.used : feature.quota;

  return `Bạn đã hết quota ${featureLabel} (${used}/${feature.quota} lượt/${quotaPeriodLabel}). Vào trang thanh toán để nâng cấp gói.`;
};
