"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Layers3,
  PackagePlus,
  Pencil,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime, formatNumber, notify } from "@/lib/admin";
import {
  useCreatePaymentPackageMutation,
  useGetPaymentPackagesQuery,
  useUpdatePaymentPackageMutation,
} from "@/store/services/paymentApi";
import type {
  PaymentFeatureAccessLevel,
  PaymentFeatureScope,
  PaymentFeatureScopePeriod,
  PaymentPackage,
  PaymentPackageBillingCycle,
  PaymentPackageFeature,
} from "@/types";

type PaymentFeatureScopeFormState = {
  featureKey: string;
  accessLevel: PaymentFeatureAccessLevel;
  quota: string;
  quotaPeriod: PaymentFeatureScopePeriod;
  note: string;
};

type PaymentPackageFormState = {
  name: string;
  slug: string;
  description: string;
  price: string;
  currency: string;
  billingCycle: PaymentPackageBillingCycle;
  featureKeys: string[];
  featureScopes: PaymentFeatureScopeFormState[];
  isActive: boolean;
  displayOrder: string;
};

type SuggestedNotePayload = {
  featureLabel: string;
  quota: string;
  quotaPeriod: PaymentFeatureScopePeriod;
};

const DEFAULT_FREE_PACKAGE_SLUG = "free";
const MIN_PAID_PACKAGE_PRICE = 2000;

const BILLING_CYCLE_OPTIONS: Array<{
  value: PaymentPackageBillingCycle;
  label: string;
}> = [
  { value: "month", label: "Theo tháng" },
  { value: "quarter", label: "Theo quý" },
  { value: "year", label: "Theo năm" },
  { value: "one_time", label: "Một lần" },
];

const DEFAULT_ACCESS_LEVEL_OPTIONS: PaymentFeatureAccessLevel[] = [
  "basic",
  "standard",
  "advanced",
  "full",
];

const DEFAULT_QUOTA_PERIOD_OPTIONS: PaymentFeatureScopePeriod[] = [
  "day",
  "week",
  "month",
  "billing_cycle",
  "lifetime",
];

const ACCESS_LEVEL_LABELS: Record<PaymentFeatureAccessLevel, string> = {
  basic: "Cơ bản",
  standard: "Tiêu chuẩn",
  advanced: "Nâng cao",
  full: "Toàn phần",
};

const QUOTA_PERIOD_LABELS: Record<PaymentFeatureScopePeriod, string> = {
  day: "Theo ngày",
  week: "Theo tuần",
  month: "Theo tháng",
  billing_cycle: "Theo chu kỳ gói",
  lifetime: "Trọn đời",
};

const getAccessLevelLabel = (value: string) =>
  ACCESS_LEVEL_LABELS[value as PaymentFeatureAccessLevel] ?? value;

const getQuotaPeriodLabel = (value: string) =>
  QUOTA_PERIOD_LABELS[value as PaymentFeatureScopePeriod] ?? value;

const NATIVE_SELECT_CLASSNAME =
  "h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

const DEFAULT_FEATURE_CATALOG: PaymentPackageFeature[] = [
  {
    key: "ai_speaking",
    label: "Luyện nói AI",
    description: "Luyện hội thoại AI với chấm điểm và phản hồi theo lượt.",
    category: "Speaking",
  },
  {
    key: "exercise_library",
    label: "Thư viện bài tập",
    description: "Bài tập theo cấp độ và mục tiêu học tập.",
    category: "Practice",
  },
  {
    key: "vocabulary_library",
    label: "Thư viện từ vựng",
    description: "Học từ mới theo chủ đề và bộ từ luyện tập.",
    category: "Từ vựng",
  },
];

const createInitialFormState = (): PaymentPackageFormState => ({
  name: "",
  slug: "",
  description: "",
  price: "",
  currency: "VND",
  billingCycle: "month",
  featureScopes: [],
  featureKeys: [],
  isActive: false,
  displayOrder: "0",
});

const formatCurrency = (value: number, currency = "VND") =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);

const buildSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const toApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error && "data" in error) {
    const data = (error as { data?: { message?: string; error?: string } })
      .data;
    if (data?.message) {
      return data.message;
    }

    if (data?.error) {
      return data.error;
    }
  }

  if (typeof error === "object" && error && "message" in error) {
    const message = (error as { message?: string }).message;
    if (message) {
      return message;
    }
  }

  return fallback;
};

const isDefaultPackage = (paymentPackage?: PaymentPackage | null) => {
  if (!paymentPackage) {
    return false;
  }

  if (paymentPackage.isDefault) {
    return true;
  }

  return buildSlug(paymentPackage.slug) === DEFAULT_FREE_PACKAGE_SLUG;
};

const buildManualScopeState = (
  featureKey: string,
): PaymentFeatureScopeFormState => ({
  featureKey,
  accessLevel: "basic",
  quota: "",
  quotaPeriod: "billing_cycle",
  note: "",
});

const synchronizeFeatureScopes = ({
  featureKeys,
  scopes,
}: {
  featureKeys: string[];
  scopes: PaymentFeatureScopeFormState[];
}) => {
  const uniqueFeatureKeys = Array.from(new Set(featureKeys));
  const scopeMap = new Map(scopes.map((scope) => [scope.featureKey, scope]));

  return uniqueFeatureKeys.map((featureKey) => {
    if (scopeMap.has(featureKey)) {
      return scopeMap.get(featureKey) as PaymentFeatureScopeFormState;
    }

    return buildManualScopeState(featureKey);
  });
};

const toFormState = (
  paymentPackage?: PaymentPackage | null,
): PaymentPackageFormState => {
  if (!paymentPackage) {
    return createInitialFormState();
  }

  const scopeMap = new Map(
    (paymentPackage.featureScopes ?? []).map((scope) => [
      scope.featureKey,
      scope,
    ]),
  );

  const featureScopes = paymentPackage.featureKeys.map((featureKey) => {
    const scope = scopeMap.get(featureKey);
    if (scope) {
      return {
        featureKey,
        accessLevel: scope.accessLevel,
        quota: scope.quota === null ? "" : String(scope.quota),
        quotaPeriod: scope.quotaPeriod,
        note: scope.note,
      };
    }

    return buildManualScopeState(featureKey);
  });

  return {
    name: paymentPackage.name,
    slug: paymentPackage.slug,
    description: paymentPackage.description,
    price: String(paymentPackage.price),
    currency: paymentPackage.currency,
    billingCycle: paymentPackage.billingCycle,
    featureKeys: paymentPackage.featureKeys,
    featureScopes,
    isActive: paymentPackage.isActive,
    displayOrder: String(paymentPackage.displayOrder),
  };
};

const summarizeQuota = (scope: PaymentFeatureScope) => {
  if (scope.quota === null) {
    return "Không giới hạn";
  }

  return `${formatNumber(scope.quota)} lượt / ${getQuotaPeriodLabel(scope.quotaPeriod)}`;
};

const buildSuggestedNote = ({
  featureLabel,
  quota,
  quotaPeriod,
}: SuggestedNotePayload) => {
  const periodLabel = (QUOTA_PERIOD_LABELS[quotaPeriod] ?? quotaPeriod).toLowerCase();
  const normalizedQuota = quota.trim();

  if (!normalizedQuota) {
    return `${featureLabel}: Không giới hạn lượt (${periodLabel}).`;
  }

  const numericQuota = Number(normalizedQuota);
  const prettyQuota =
    Number.isFinite(numericQuota) && numericQuota >= 0
      ? formatNumber(Math.floor(numericQuota))
      : normalizedQuota;

  return `${featureLabel}: Tối đa ${prettyQuota} lượt (${periodLabel}).`;
};

export function PaymentPackagesManager() {
  const { data, isLoading, isError, error, refetch } =
    useGetPaymentPackagesQuery({
      includeInactive: true,
    });
  const [createPaymentPackage, { isLoading: isCreating }] =
    useCreatePaymentPackageMutation();
  const [updatePaymentPackage, { isLoading: isUpdating }] =
    useUpdatePaymentPackageMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PaymentPackage | null>(
    null,
  );
  const [formState, setFormState] =
    useState<PaymentPackageFormState>(createInitialFormState());
  const [slugTouched, setSlugTouched] = useState(false);

  const packages = data?.packages ?? [];
  const featureCatalog = data?.featureCatalog ?? DEFAULT_FEATURE_CATALOG;
  const activeLimit = data?.activeLimit ?? 3;
  const activePackages = packages.filter(
    (item) => item.isActive && !isDefaultPackage(item),
  );
  const isSubmitting = isCreating || isUpdating;
  const isEditingDefaultPackage = isDefaultPackage(editingPackage);

  const accessLevelOptions =
    data?.scopeConfig?.accessLevelOptions ?? DEFAULT_ACCESS_LEVEL_OPTIONS;
  const quotaPeriodOptions =
    data?.scopeConfig?.quotaPeriodOptions ?? DEFAULT_QUOTA_PERIOD_OPTIONS;

  const featureLabelLookup = useMemo(
    () =>
      new Map(featureCatalog.map((feature) => [feature.key, feature.label])),
    [featureCatalog],
  );

  const openCreateDialog = () => {
    setEditingPackage(null);
    setFormState({
      ...createInitialFormState(),
      displayOrder: String(packages.length),
    });
    setSlugTouched(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (paymentPackage: PaymentPackage) => {
    setEditingPackage(paymentPackage);
    setFormState(toFormState(paymentPackage));
    setSlugTouched(true);
    setIsDialogOpen(true);
  };

  const updateForm = <K extends keyof PaymentPackageFormState>(
    key: K,
    value: PaymentPackageFormState[K],
  ) => {
    setFormState((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleNameChange = (value: string) => {
    setFormState((current) => ({
      ...current,
      name: value,
      slug: slugTouched ? current.slug : buildSlug(value),
    }));
  };

  const handleFeatureToggle = (featureKey: string) => {
    setFormState((current) => {
      const exists = current.featureKeys.includes(featureKey);
      const nextFeatureKeys = exists
        ? current.featureKeys.filter((item) => item !== featureKey)
        : [...current.featureKeys, featureKey];

      return {
        ...current,
        featureKeys: nextFeatureKeys,
        featureScopes: synchronizeFeatureScopes({
          featureKeys: nextFeatureKeys,
          scopes: current.featureScopes,
        }),
      };
    });
  };

  const handleScopeChange = <K extends keyof PaymentFeatureScopeFormState>(
    featureKey: string,
    field: K,
    value: PaymentFeatureScopeFormState[K],
  ) => {
    setFormState((current) => {
      const shouldRefreshNote = field === "quota" || field === "quotaPeriod";
      const resolveFeatureLabel = (nextFeatureKey: string) =>
        featureLabelLookup.get(nextFeatureKey) ?? nextFeatureKey;

      const getSuggestedNoteFromScope = (
        scope: PaymentFeatureScopeFormState,
      ) =>
        buildSuggestedNote({
          featureLabel: resolveFeatureLabel(scope.featureKey),
          quota: scope.quota,
          quotaPeriod: scope.quotaPeriod,
        });

      let isUpdated = false;
      const nextFeatureScopes = current.featureScopes.map((scope) => {
        if (scope.featureKey !== featureKey) {
          return scope;
        }

        isUpdated = true;
        const nextScope: PaymentFeatureScopeFormState = {
          ...scope,
          [field]: value,
        };

        if (shouldRefreshNote) {
          const previousSuggestedNote = getSuggestedNoteFromScope(scope);
          const nextSuggestedNote = getSuggestedNoteFromScope(nextScope);
          const shouldApplyAutoNote =
            scope.note.trim() === "" || scope.note === previousSuggestedNote;

          if (shouldApplyAutoNote) {
            nextScope.note = nextSuggestedNote;
          }
        }

        return nextScope;
      });

      if (!isUpdated && current.featureKeys.includes(featureKey)) {
        const nextScope: PaymentFeatureScopeFormState = {
          ...buildManualScopeState(featureKey),
          [field]: value,
        } as PaymentFeatureScopeFormState;

        if (shouldRefreshNote) {
          nextScope.note = getSuggestedNoteFromScope(nextScope);
        }

        nextFeatureScopes.push(nextScope);
      }

      return {
        ...current,
        featureScopes: nextFeatureScopes,
      };
    });
  };

  const applySuggestedNotes = () => {
    setFormState((current) => ({
      ...current,
      featureScopes: current.featureScopes.map((scope) => ({
        ...scope,
        note: buildSuggestedNote({
          featureLabel:
            featureLabelLookup.get(scope.featureKey) ?? scope.featureKey,
          quota: scope.quota,
          quotaPeriod: scope.quotaPeriod,
        }),
      })),
    }));

    notify({
      title: "Đã áp dụng ghi chú gợi ý",
      message: "Hệ thống đã cập nhật ghi chú theo quota và chu kỳ quota hiện tại.",
      type: "success",
    });
  };

  const previewName = formState.name.trim()
    ? formState.name
    : "Tên gói";
  const previewDescription = formState.description.trim()
    ? formState.description
    : "Mô tả gói sẽ hiển thị tại đây.";
  const normalizedPreviewPrice = formState.price.trim();
  const previewPriceValue = Number(normalizedPreviewPrice);
  const previewPrice =
    normalizedPreviewPrice && Number.isFinite(previewPriceValue)
      ? formatCurrency(previewPriceValue)
      : "0 ₫";
  const previewSlug =
    buildSlug(formState.slug || formState.name) || "slug-preview";

  const handleSubmit = async () => {
    const price = Number(formState.price);
    const displayOrder = Number(formState.displayOrder);
    const normalizedSlug = buildSlug(formState.slug || formState.name);

    if (!formState.name.trim()) {
      notify({
        title: "Thiếu tên gói",
        message: "Tên gói không được để trống.",
        type: "warning",
      });
      return;
    }

    if (!formState.slug.trim()) {
      notify({
        title: "Thiếu slug",
        message: "Vui lòng nhập slug hoặc để hệ thống tạo từ tên gói.",
        type: "warning",
      });
      return;
    }

    if (!editingPackage && normalizedSlug === DEFAULT_FREE_PACKAGE_SLUG) {
      notify({
        title: "Không thể tạo thêm gói mặc định",
        message:
          "Gói Free mặc định được hệ thống quản lý sẵn. Bạn chỉ chỉnh quyền/quota của gói này.",
        type: "warning",
      });
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      notify({
        title: "Giá gói không hợp lệ",
        message: "Giá gói phải là số không âm.",
        type: "warning",
      });
      return;
    }

    if (!isEditingDefaultPackage && price < MIN_PAID_PACKAGE_PRICE) {
      notify({
        title: "Giá gói trả phí chưa hợp lệ",
        message: `Gói trả phí phải có giá tối thiểu ${formatNumber(MIN_PAID_PACKAGE_PRICE)}đ.`,
        type: "warning",
      });
      return;
    }

    if (!Number.isFinite(displayOrder) || displayOrder < 0) {
      notify({
        title: "Thứ tự hiển thị không hợp lệ",
        message: "Display order phải là số không âm.",
        type: "warning",
      });
      return;
    }

    if (formState.featureKeys.length === 0) {
      notify({
        title: "Chưa chọn chức năng",
        message: "Mỗi gói cần có ít nhất một chức năng được cấp.",
        type: "warning",
      });
      return;
    }

    const scopeByFeatureKey = new Map(
      formState.featureScopes.map((scope) => [scope.featureKey, scope]),
    );

    const featureScopesPayload: PaymentFeatureScope[] = [];

    for (const featureKey of formState.featureKeys) {
      const scope = scopeByFeatureKey.get(featureKey);
      if (!scope) {
        notify({
          title: "Thiếu cấu hình phạm vi",
          message: `Chức năng ${featureLabelLookup.get(featureKey) ?? featureKey} chưa có cấu hình quota.`,
          type: "warning",
        });
        return;
      }

      const normalizedQuota = scope.quota.trim();
      const quotaValue =
        normalizedQuota === "" ? null : Number(normalizedQuota);

      if (
        quotaValue !== null &&
        (!Number.isFinite(quotaValue) || quotaValue < 0)
      ) {
        notify({
          title: "Quota không hợp lệ",
          message: `Quota của chức năng ${featureLabelLookup.get(featureKey) ?? featureKey} phải là số không âm hoặc để trống.`,
          type: "warning",
        });
        return;
      }

      featureScopesPayload.push({
        featureKey,
        accessLevel: scope.accessLevel,
        quota: quotaValue === null ? null : Math.floor(quotaValue),
        quotaPeriod: scope.quotaPeriod,
        note: scope.note.trim(),
      });
    }

    const payload = {
      name: formState.name.trim(),
      slug: normalizedSlug,
      description: formState.description.trim(),
      price,
      currency: formState.currency.trim().toUpperCase() || "VND",
      billingCycle: formState.billingCycle,
      featureKeys: formState.featureKeys,
      featureScopes: featureScopesPayload,
      isActive: formState.isActive,
      displayOrder: Math.floor(displayOrder),
    };

    if (isEditingDefaultPackage && editingPackage) {
      payload.name = editingPackage.name;
      payload.slug = editingPackage.slug;
      payload.description = editingPackage.description;
      payload.price = 0;
      payload.currency = editingPackage.currency;
      payload.billingCycle = editingPackage.billingCycle;
      payload.isActive = true;
      payload.displayOrder = editingPackage.displayOrder;
    }

    try {
      if (editingPackage) {
        await updatePaymentPackage({
          packageId: editingPackage.id,
          data: payload,
        }).unwrap();

        notify({
          title: "Đã cập nhật gói",
          message: `Gói ${payload.name} đã được cập nhật thành công.`,
          type: "success",
        });
      } else {
        await createPaymentPackage(payload).unwrap();

        notify({
          title: "Đã tạo gói mới",
          message: `Gói ${payload.name} đã được tạo thành công.`,
          type: "success",
        });
      }

      setIsDialogOpen(false);
      setEditingPackage(null);
      setFormState(createInitialFormState());
      setSlugTouched(false);
    } catch (submitError) {
      notify({
        title: editingPackage
          ? "Không cập nhật được gói"
          : "Không tạo được gói",
        message: toApiErrorMessage(
          submitError,
          "Backend từ chối dữ liệu gói thanh toán. Kiểm tra lại thông tin.",
        ),
        type: "error",
      });
    }
  };

  if (isLoading && !data) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-6 text-sm text-slate-500">
        Đang tải danh sách gói thanh toán...
      </div>
    );
  }

  if (isError && !data) {
    return (
      <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-6 text-sm text-rose-700">
        {toApiErrorMessage(
          error,
          "Không tải được dữ liệu gói thanh toán từ backend.",
        )}
      </div>
    );
  }

  return (
    <>
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200 py-5">
          <CardContent className="flex items-start justify-between gap-4 pt-1">
            <div>
              <p className="text-sm text-slate-500">Tổng số gói</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {formatNumber(packages.length)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Bao gồm cả gói đang active và inactive.
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Layers3 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 py-5">
          <CardContent className="flex items-start justify-between gap-4 pt-1">
            <div>
              <p className="text-sm text-slate-500">Gói trả phí đang mở</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {activePackages.length}/{activeLimit}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Gói Free mặc định không tính vào giới hạn này.
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 py-5">
          <CardContent className="flex items-start justify-between gap-4 pt-1">
            <div>
              <p className="text-sm text-slate-500">Tổng chức năng</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {formatNumber(featureCatalog.length)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Chức năng có thể bật/tắt theo từng gói.
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-[30px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <Badge
              variant="outline"
              className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500"
            >
              Package Permissions
            </Badge>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
              Quản lý gói thanh toán và ma trận phạm vi.
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Mỗi gói sẽ có quy định rõ chức năng nào được mở, ở mức độ nào và
              quota bao nhiêu lượt theo chu kỳ để frontend hiển thị đúng quyền
              lợi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => void refetch()}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
            <Button
              type="button"
              className="rounded-full bg-slate-950 text-white hover:bg-slate-800"
              onClick={openCreateDialog}
            >
              <PackagePlus className="mr-2 h-4 w-4" />
              Tạo gói mới
            </Button>
          </div>
        </div>
      </section>

      <section>
        <Card className="border-slate-200 py-5">
          <CardHeader>
            <CardTitle>Danh sách gói thanh toán</CardTitle>
          </CardHeader>
          <CardContent>
            {packages.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                Chưa có gói thanh toán nào. Bấm “Tạo gói mới” để khởi tạo plan
                đầu tiên.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gói</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>Chu kỳ</TableHead>
                    <TableHead>Chức năng</TableHead>
                    <TableHead>Phạm vi</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Cập nhật</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.map((paymentPackage) => (
                    <TableRow key={paymentPackage.id}>
                      <TableCell className="min-w-[260px]">
                        <div>
                          <p className="font-medium text-slate-900">
                            {paymentPackage.name}
                          </p>
                          {isDefaultPackage(paymentPackage) ? (
                            <Badge
                              variant="outline"
                              className="mt-2 rounded-full border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700"
                            >
                              Mặc định
                            </Badge>
                          ) : null}
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                            {paymentPackage.slug}
                          </p>
                          <p className="mt-2 text-sm text-slate-600">
                            {paymentPackage.description || "Chưa có mô tả gói."}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(
                          paymentPackage.price,
                          paymentPackage.currency,
                        )}
                      </TableCell>
                      <TableCell>{paymentPackage.billingCycle}</TableCell>
                      <TableCell>{paymentPackage.featureKeys.length}</TableCell>
                      <TableCell>
                        {paymentPackage.featureScopes.length}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            paymentPackage.isActive
                              ? "rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700"
                              : "rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
                          }
                        >
                          {paymentPackage.isActive ? "Đang mở" : "Đang tắt"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDateTime(paymentPackage.updatedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => openEditDialog(paymentPackage)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-slate-200 py-5">
          <CardHeader>
            <CardTitle>Ma trận phạm vi theo module</CardTitle>
          </CardHeader>
          <CardContent>
            {packages.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                Chưa có dữ liệu gói để hiển thị ma trận phạm vi.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[260px]">Module</TableHead>
                      {packages.map((paymentPackage) => (
                        <TableHead
                          key={`heading-${paymentPackage.id}`}
                          className="min-w-[220px]"
                        >
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-900">
                              {paymentPackage.name}
                            </p>
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                              {paymentPackage.slug}
                            </p>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {featureCatalog.map((feature) => (
                      <TableRow key={feature.key}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900">
                              {feature.label}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                              {feature.category}
                            </p>
                            <p className="mt-2 text-sm text-slate-600">
                              {feature.description}
                            </p>
                          </div>
                        </TableCell>
                        {packages.map((paymentPackage) => {
                          const scope = paymentPackage.featureScopes.find(
                            (item) => item.featureKey === feature.key,
                          );

                          if (!scope) {
                            return (
                              <TableCell
                                key={`${feature.key}-${paymentPackage.id}`}
                              >
                                <span className="text-sm text-slate-400">
                                  Không mở
                                </span>
                              </TableCell>
                            );
                          }

                          return (
                            <TableCell
                              key={`${feature.key}-${paymentPackage.id}`}
                            >
                              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                                <p className="font-semibold text-slate-900">
                                  {ACCESS_LEVEL_LABELS[scope.accessLevel]}
                                </p>
                                <p className="mt-1 text-slate-600">
                                  {summarizeQuota(scope)}
                                </p>
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="!w-[calc(100vw-2rem)] sm:!w-[calc(100vw-5rem)] sm:!max-w-[1480px] max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPackage
                ? "Chỉnh sửa gói thanh toán"
                : "Tạo gói thanh toán"}
            </DialogTitle>
            <DialogDescription>
              Cấu hình thông tin gói, danh sách chức năng, mức độ truy cập và
              quota theo module. Backend sẽ chặn nếu số gói active vượt giới
              hạn.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="package-name">Tên gói</Label>
                <Input
                  id="package-name"
                  value={formState.name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  placeholder="VD: Plus"
                  disabled={isEditingDefaultPackage}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="package-slug">Slug</Label>
                <Input
                  id="package-slug"
                  value={formState.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    updateForm("slug", event.target.value);
                  }}
                  placeholder="plus"
                  disabled={isEditingDefaultPackage}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="package-price">Giá gói</Label>
                  <Input
                    id="package-price"
                    value={formState.price}
                    onChange={(event) =>
                      updateForm("price", event.target.value)
                    }
                    placeholder="300000"
                    inputMode="numeric"
                    disabled={isEditingDefaultPackage}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="package-order">Display order</Label>
                  <Input
                    id="package-order"
                    value={formState.displayOrder}
                    onChange={(event) =>
                      updateForm("displayOrder", event.target.value)
                    }
                    placeholder="0"
                    inputMode="numeric"
                    disabled={isEditingDefaultPackage}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Chu kỳ thanh toán</Label>
                  <select
                    value={formState.billingCycle}
                    disabled={isEditingDefaultPackage}
                    onChange={(event) =>
                      updateForm(
                        "billingCycle",
                        event.target.value as PaymentPackageBillingCycle,
                      )
                    }
                    className={NATIVE_SELECT_CLASSNAME}
                  >
                    {BILLING_CYCLE_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="package-currency">Tiền tệ</Label>
                  <Input
                    id="package-currency"
                    value={formState.currency}
                    onChange={(event) =>
                      updateForm("currency", event.target.value)
                    }
                    placeholder="VND"
                    disabled={isEditingDefaultPackage}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="package-description">Mô tả ngắn</Label>
                <Textarea
                  id="package-description"
                  value={formState.description}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  placeholder="Mô tả hiển thị trên card thanh toán."
                  rows={5}
                  disabled={isEditingDefaultPackage}
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Kích hoạt gói
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {isEditingDefaultPackage
                        ? "Gói Free mặc định luôn bật và không chiếm slot gói trả phí."
                        : `Slot active gói trả phí: ${activePackages.length}/${activeLimit}`}
                    </p>
                  </div>
                  <Switch
                    checked={
                      isEditingDefaultPackage ? true : formState.isActive
                    }
                    onCheckedChange={(checked) =>
                      updateForm("isActive", checked)
                    }
                    disabled={isEditingDefaultPackage}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Preview nhanh</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {previewName}
                </p>
                <p className="mt-1 text-slate-600">
                  {previewDescription}
                </p>
                <p className="mt-4 text-2xl font-semibold text-slate-950">
                  {previewPrice}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                  {previewSlug}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Chọn chức năng cho gói
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Đã chọn {formatNumber(formState.featureKeys.length)} /{" "}
                      {formatNumber(featureCatalog.length)} chức năng.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={applySuggestedNotes}
                    disabled={formState.featureKeys.length === 0}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Áp dụng ghi chú gợi ý
                  </Button>
                </div>
              </div>

              <div className="max-h-[220px] overflow-auto rounded-2xl border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Chức năng</TableHead>
                      <TableHead>Nhóm</TableHead>
                      <TableHead className="text-right">Chọn</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {featureCatalog.map((feature: PaymentPackageFeature) => {
                      const checked = formState.featureKeys.includes(
                        feature.key,
                      );

                      return (
                        <TableRow key={feature.key}>
                          <TableCell className="font-medium text-slate-900">
                            {feature.label}
                          </TableCell>
                          <TableCell>{feature.category}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() =>
                                  handleFeatureToggle(feature.key)
                                }
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="min-h-[320px] max-h-[56vh] space-y-3 overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
                {formState.featureKeys.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-500">
                    Chọn ít nhất một chức năng để cấu hình mức độ và quota.
                  </div>
                ) : (
                  formState.featureScopes.map((scope) => (
                    <div
                      key={scope.featureKey}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {featureLabelLookup.get(scope.featureKey) ??
                          scope.featureKey}
                      </p>

                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label>Mức độ</Label>
                          <select
                            value={scope.accessLevel}
                            onChange={(event) =>
                              handleScopeChange(
                                scope.featureKey,
                                "accessLevel",
                                event.target.value as PaymentFeatureAccessLevel,
                              )
                            }
                            className={NATIVE_SELECT_CLASSNAME}
                          >
                            {accessLevelOptions.map((option) => (
                              <option key={option} value={option}>
                                {getAccessLevelLabel(option)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <Label>Quota lượt</Label>
                          <Input
                            value={scope.quota}
                            onChange={(event) =>
                              handleScopeChange(
                                scope.featureKey,
                                "quota",
                                event.target.value,
                              )
                            }
                            placeholder="Để trống = không giới hạn"
                            inputMode="numeric"
                          />
                        </div>
                      </div>

                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label>Chu kỳ quota</Label>
                          <select
                            value={scope.quotaPeriod}
                            onChange={(event) =>
                              handleScopeChange(
                                scope.featureKey,
                                "quotaPeriod",
                                event.target.value as PaymentFeatureScopePeriod,
                              )
                            }
                            className={NATIVE_SELECT_CLASSNAME}
                          >
                            {quotaPeriodOptions.map((option) => (
                              <option key={option} value={option}>
                                {getQuotaPeriodLabel(option)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <Label>Ghi chú</Label>
                          <Input
                            value={scope.note}
                            onChange={(event) =>
                              handleScopeChange(
                                scope.featureKey,
                                "note",
                                event.target.value,
                              )
                            }
                            placeholder="Mô tả quyền lợi trên UI"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setIsDialogOpen(false)}
            >
              Đóng
            </Button>
            <Button
              type="button"
              className="rounded-xl bg-slate-950 text-white hover:bg-slate-800"
              onClick={() => void handleSubmit()}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  {editingPackage ? "Cập nhật gói" : "Tạo gói"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
