"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  CircleCheckBig,
  Clock3,
  Copy,
  LoaderCircle,
  RefreshCcw,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { API_BASE_URL } from "@/config/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { notify } from "@/lib/admin";
import { tokenManager } from "@/lib/token-manager";
import {
  useCancelPaymentMutation,
  useCreatePaymentMutation,
  useGetMyFeatureQuotasQuery,
  useGetPaymentPackagesQuery,
  useReconcilePaymentMutation,
} from "@/store/services/paymentApi";
import type {
  FeatureQuotaItem,
  PaymentFeatureScope,
  PaymentPackage,
  PaymentRecord,
  PaymentSyncSummary,
} from "@/types";

type PricingPlan = {
  id: string;
  slug: string | null;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycleLabel: string;
  ctaLabel: string;
  featureLines: string[];
  packageId: string | null;
  isFree: boolean;
};

type UpgradeConfirmationToastState = {
  currentPlanName: string;
  nextPlan: PricingPlan;
};

const MANUAL_CHECK_COOLDOWN_SECONDS = 10;
const AUTO_CHECK_DELAY_MS = 10000;
const MIN_PAID_PACKAGE_AMOUNT = 2000;

const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const normalizedBase = API_BASE_URL.trim();

  if (!normalizedBase) {
    return normalizedPath;
  }

  if (/^https?:\/\//i.test(normalizedBase)) {
    return `${normalizedBase.replace(/\/$/, "")}${normalizedPath}`;
  }

  const prefixedBase = normalizedBase.startsWith("/")
    ? normalizedBase
    : `/${normalizedBase}`;

  return `${prefixedBase.replace(/\/$/, "")}${normalizedPath}`;
};

const formatCurrency = (value: number, currency = "VND") =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);

const formatCountdown = (remainingSeconds: number) => {
  const safeSeconds = Math.max(0, remainingSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const BANK_NAMES: Record<string, string> = {
  mb: "MB Bank",
  vcb: "Vietcombank",
  tcb: "Techcombank",
  vpb: "VPBank",
  acb: "ACB",
  bidv: "BIDV",
};

const getBankDisplayName = (bankCode: string | null | undefined) => {
  const normalized = String(bankCode ?? "")
    .trim()
    .toLowerCase();
  if (!normalized) {
    return "N/A";
  }

  return BANK_NAMES[normalized] ?? normalized.toUpperCase();
};

const getBillingCycleLabel = (
  value: PaymentPackage["billingCycle"] | "free",
) => {
  if (value === "free") {
    return "/tháng";
  }

  if (value === "quarter") {
    return "/quý";
  }

  if (value === "year") {
    return "/năm";
  }

  if (value === "one_time") {
    return "/lần";
  }

  return "/tháng";
};

const QUOTA_PERIOD_LABELS = {
  day: "ngày",
  week: "tuần",
  month: "tháng",
  billing_cycle: "chu kỳ",
  lifetime: "trọn đời",
} as const;

const ACCESS_LEVEL_LABELS = {
  basic: "Cơ bản",
  standard: "Tiêu chuẩn",
  advanced: "Nâng cao",
  full: "Toàn phần",
} as const;

const describeScope = (scope: PaymentFeatureScope | undefined) => {
  if (!scope) {
    return "Không mở";
  }

  const level = ACCESS_LEVEL_LABELS[scope.accessLevel] ?? scope.accessLevel;
  if (scope.quota === null) {
    return `${level}, không giới hạn`;
  }

  return `${level}, ${scope.quota} lượt/${QUOTA_PERIOD_LABELS[scope.quotaPeriod]}`;
};

const formatRemainingQuotaLabel = (feature: FeatureQuotaItem) => {
  if (!feature.enabled) {
    return "Chưa mở trong gói hiện tại";
  }

  if (feature.isUnlimited || feature.quota === null) {
    return "Không giới hạn";
  }

  if (feature.remaining === null || feature.used === null) {
    return "Đang cập nhật";
  }

  return `Còn ${Math.max(0, feature.remaining)}/${feature.quota} lượt`;
};

const extractErrorMessage = (error: unknown, fallback: string) => {
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

  if (typeof error === "object" && error && "status" in error) {
    return `Yêu cầu thất bại (${String((error as { status: unknown }).status)}).`;
  }

  return fallback;
};

const isExpiredState = (payment: PaymentRecord | null) => {
  if (!payment) {
    return false;
  }

  if (payment.isExpired) {
    return true;
  }

  return payment.status === "failed" && payment.failureReason === "expired";
};

const canCancelPendingPayment = (
  payment: PaymentRecord | null,
  now = Date.now(),
) => {
  if (!payment || payment.status !== "pending") {
    return false;
  }

  if (!payment.expiresAt) {
    return true;
  }

  const expiresAtMs = new Date(payment.expiresAt).getTime();
  if (Number.isNaN(expiresAtMs)) {
    return true;
  }

  return expiresAtMs > now;
};

const buildPackageFeatureLines = (
  paymentPackage: PaymentPackage,
  featureLabelLookup: Map<string, string>,
) => {
  const scopeByKey = new Map(
    (paymentPackage.featureScopes ?? []).map((scope) => [
      scope.featureKey,
      scope,
    ]),
  );

  return paymentPackage.featureKeys.map((featureKey) => {
    const featureLabel = featureLabelLookup.get(featureKey) ?? featureKey;
    const scope = scopeByKey.get(featureKey);
    return `${featureLabel}: ${describeScope(scope)}`;
  });
};

export default function PaymentPackagesPage() {
  const router = useRouter();
  const { data, isLoading, isError, error } = useGetPaymentPackagesQuery();
  const { data: featureQuotaOverview, isFetching: isFeatureQuotaFetching } =
    useGetMyFeatureQuotasQuery();
  const [createPayment, { isLoading: isCreatingPayment }] =
    useCreatePaymentMutation();
  const [reconcilePayment, { isLoading: isReconcilingPayment }] =
    useReconcilePaymentMutation();
  const [cancelPayment] = useCancelPaymentMutation();
  const [creatingPackageId, setCreatingPackageId] = useState<string | null>(
    null,
  );
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [checkoutPlanName, setCheckoutPlanName] = useState<string>("");
  const [checkoutPayment, setCheckoutPayment] = useState<PaymentRecord | null>(
    null,
  );
  const [checkoutSyncSummary, setCheckoutSyncSummary] =
    useState<PaymentSyncSummary | null>(null);
  const [checkoutSyncError, setCheckoutSyncError] = useState<string | null>(
    null,
  );
  const [upgradeConfirmation, setUpgradeConfirmation] =
    useState<UpgradeConfirmationToastState | null>(null);
  const [checkCooldownSeconds, setCheckCooldownSeconds] = useState(0);
  const [clockNow, setClockNow] = useState<number>(Date.now());
  const autoCheckedInvoiceRef = useRef<string | null>(null);
  const cancelledInvoiceRef = useRef<string | null>(null);
  const checkoutPaymentRef = useRef<PaymentRecord | null>(null);

  const packages = useMemo(
    () => [...(data?.packages ?? [])].sort((a, b) => a.price - b.price),
    [data?.packages],
  );

  const featureLabelLookup = useMemo(
    () =>
      new Map(
        (data?.featureCatalog ?? []).map((feature) => [
          feature.key,
          feature.label,
        ]),
      ),
    [data?.featureCatalog],
  );

  const pricingPlans = useMemo<PricingPlan[]>(() => {
    const defaultFreePackage =
      packages.find((paymentPackage) => paymentPackage.isDefault) ||
      packages.find((paymentPackage) => paymentPackage.price === 0);

    const freePlan: PricingPlan = defaultFreePackage
      ? {
          id: defaultFreePackage.id,
          slug: defaultFreePackage.slug,
          name: defaultFreePackage.name,
          description:
            defaultFreePackage.description ||
            "Dành cho các nhu cầu học cơ bản mỗi ngày.",
          price: 0,
          currency: defaultFreePackage.currency,
          billingCycleLabel: getBillingCycleLabel("free"),
          ctaLabel: "Dùng bản Free",
          featureLines: buildPackageFeatureLines(
            defaultFreePackage,
            featureLabelLookup,
          ),
          packageId: defaultFreePackage.id,
          isFree: true,
        }
      : {
          id: "free-fallback",
          slug: "free",
          name: "Free",
          description: "Dành cho các nhu cầu học cơ bản mỗi ngày.",
          price: 0,
          currency: "VND",
          billingCycleLabel: getBillingCycleLabel("free"),
          ctaLabel: "Dùng bản Free",
          featureLines: [
            "Luyện nói AI: Cơ bản, 50 lượt/tháng",
            "Thư viện bài tập: Tiêu chuẩn, 120 lượt/tuần",
            "Thư viện từ vựng: Tiêu chuẩn, 300 lượt/tuần",
          ],
          packageId: null,
          isFree: true,
        };

    const paidPlans = packages
      .filter((paymentPackage) => paymentPackage.id !== defaultFreePackage?.id)
      .filter(
        (paymentPackage) => paymentPackage.price >= MIN_PAID_PACKAGE_AMOUNT,
      )
      .map<PricingPlan>((paymentPackage) => ({
        id: paymentPackage.id,
        slug: paymentPackage.slug,
        name: paymentPackage.name,
        description:
          paymentPackage.description ||
          "Nâng cấp đầy đủ trải nghiệm học tập với nhiều quyền lợi hơn.",
        price: paymentPackage.price,
        currency: paymentPackage.currency,
        billingCycleLabel: getBillingCycleLabel(paymentPackage.billingCycle),
        ctaLabel: `Dùng bản ${paymentPackage.name}`,
        featureLines: buildPackageFeatureLines(
          paymentPackage,
          featureLabelLookup,
        ),
        packageId: paymentPackage.id,
        isFree: false,
      }));

    return [freePlan, ...paidPlans];
  }, [featureLabelLookup, packages]);

  const highlightedPaidPlanId = useMemo(
    () => pricingPlans.find((plan) => !plan.isFree)?.id ?? null,
    [pricingPlans],
  );

  const planRankLookup = useMemo(
    () => new Map(pricingPlans.map((plan, index) => [plan.id, index])),
    [pricingPlans],
  );

  const currentPricingPlan = useMemo(() => {
    const quotaPackageSlug = String(featureQuotaOverview?.packageSlug ?? "")
      .trim()
      .toLowerCase();
    const quotaPackageName = String(featureQuotaOverview?.packageName ?? "")
      .trim()
      .toLowerCase();

    if (quotaPackageSlug) {
      const matchedBySlug = pricingPlans.find(
        (plan) =>
          String(plan.slug ?? "")
            .trim()
            .toLowerCase() === quotaPackageSlug,
      );

      if (matchedBySlug) {
        return matchedBySlug;
      }
    }

    if (!quotaPackageName) {
      return null;
    }

    return (
      pricingPlans.find(
        (plan) => plan.name.trim().toLowerCase() === quotaPackageName,
      ) ?? null
    );
  }, [
    featureQuotaOverview?.packageName,
    featureQuotaOverview?.packageSlug,
    pricingPlans,
  ]);

  const currentPlanRank = useMemo(() => {
    if (!currentPricingPlan) {
      return null;
    }

    return planRankLookup.get(currentPricingPlan.id) ?? null;
  }, [currentPricingPlan, planRankLookup]);

  useEffect(() => {
    checkoutPaymentRef.current = checkoutPayment;
  }, [checkoutPayment]);

  const expiresAtMs = useMemo(() => {
    if (!checkoutPayment?.expiresAt) {
      return null;
    }

    const parsed = new Date(checkoutPayment.expiresAt).getTime();
    if (Number.isNaN(parsed)) {
      return null;
    }

    return parsed;
  }, [checkoutPayment?.expiresAt]);

  const remainingSeconds = useMemo(() => {
    if (!expiresAtMs) {
      return null;
    }

    return Math.floor((expiresAtMs - clockNow) / 1000);
  }, [clockNow, expiresAtMs]);

  const expiredByClock =
    checkoutPayment?.status === "pending" &&
    remainingSeconds !== null &&
    remainingSeconds <= 0;

  const isExpiredPayment = isExpiredState(checkoutPayment) || expiredByClock;
  const isPaidPayment = checkoutPayment?.status === "paid";
  const isCancelledPayment =
    checkoutPayment?.status === "failed" &&
    checkoutPayment.failureReason === "cancelled_by_user";
  const canManualCheckPayment =
    checkoutPayment?.status === "pending" &&
    !isExpiredPayment &&
    !isCancelledPayment;

  const resolveCheckoutStatusText = () => {
    if (isPaidPayment) {
      return "Đã xác nhận thanh toán";
    }

    if (isCancelledPayment) {
      return "Giao dịch đã hủy";
    }

    if (isExpiredPayment) {
      return "Mã QR đã hết hạn";
    }

    if (checkoutPayment?.status === "failed") {
      return "Thanh toán thất bại";
    }

    return "Hệ thống đang tự động kiểm tra giao dịch...";
  };

  const handleCopy = async (
    value: string | null | undefined,
    label: string,
  ) => {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      notify({
        title: `Đã sao chép ${label}`,
        type: "success",
      });
    } catch (_error) {
      notify({
        title: "Không sao chép được",
        message: "Trình duyệt từ chối quyền truy cập clipboard.",
        type: "error",
      });
    }
  };

  const fireAndForgetCancelPendingPayment = useCallback(
    (invoiceNumber: string | null | undefined) => {
      const normalizedInvoice = String(invoiceNumber ?? "").trim();
      if (
        !normalizedInvoice ||
        cancelledInvoiceRef.current === normalizedInvoice
      ) {
        return;
      }

      cancelledInvoiceRef.current = normalizedInvoice;

      const accessToken = tokenManager.getAccessToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers.authorization = `Bearer ${accessToken}`;
      }

      void fetch(buildApiUrl("/payments/cancel"), {
        method: "POST",
        headers,
        body: JSON.stringify({
          invoiceNumber: normalizedInvoice,
        }),
        keepalive: true,
      }).catch(() => {
        cancelledInvoiceRef.current = null;
      });
    },
    [],
  );

  const cancelCurrentPendingPayment = useCallback(
    async (mode: "request" | "fire-and-forget") => {
      const currentPayment = checkoutPaymentRef.current;
      if (
        !canCancelPendingPayment(currentPayment) ||
        !currentPayment?.invoiceNumber
      ) {
        return;
      }

      if (mode === "fire-and-forget") {
        fireAndForgetCancelPendingPayment(currentPayment.invoiceNumber);
        return;
      }

      if (cancelledInvoiceRef.current === currentPayment.invoiceNumber) {
        return;
      }

      cancelledInvoiceRef.current = currentPayment.invoiceNumber;

      try {
        const result = await cancelPayment({
          invoiceNumber: currentPayment.invoiceNumber,
        }).unwrap();

        if (result.payment) {
          setCheckoutPayment(result.payment);
        }
      } catch (_error) {
        cancelledInvoiceRef.current = null;
      }
    },
    [cancelPayment, fireAndForgetCancelPendingPayment],
  );

  const runReconcile = useCallback(
    async (silent: boolean) => {
      if (!checkoutPayment?.invoiceNumber || !canManualCheckPayment) {
        return;
      }

      try {
        setCheckoutSyncError(null);
        const result = await reconcilePayment({
          invoiceNumber: checkoutPayment.invoiceNumber,
        }).unwrap();

        setCheckoutPayment(result.payment);
        setCheckoutSyncSummary(result.syncSummary);

        if (!silent) {
          notify({
            title: result.allowProceed
              ? "Đã thanh toán"
              : "Đã kiểm tra giao dịch",
            message: result.allowProceed
              ? "Giao dịch đã được hệ thống xác nhận."
              : "Chưa ghi nhận thanh toán, bạn vui lòng thử lại sau ít giây.",
            type: result.allowProceed ? "success" : "info",
          });
        }
      } catch (reconcileError) {
        const message = extractErrorMessage(
          reconcileError,
          "Hệ thống chưa thể kiểm tra giao dịch lúc này.",
        );

        setCheckoutSyncError(message);

        if (!silent) {
          notify({
            title: "Không kiểm tra được giao dịch",
            message,
            type: "error",
          });
        }
      }
    },
    [canManualCheckPayment, checkoutPayment?.invoiceNumber, reconcilePayment],
  );

  const handleManualCheckPayment = async () => {
    if (
      checkCooldownSeconds > 0 ||
      isReconcilingPayment ||
      !canManualCheckPayment
    ) {
      return;
    }

    setCheckCooldownSeconds(MANUAL_CHECK_COOLDOWN_SECONDS);
    await runReconcile(false);
  };

  const handleCreateNewInvoice = async () => {
    if (!checkoutPayment?.packageId) {
      notify({
        title: "Không tạo được mã mới",
        message: "Không tìm thấy thông tin gói của giao dịch hiện tại.",
        type: "error",
      });
      return;
    }

    try {
      const created = await createPayment({
        packageId: checkoutPayment.packageId,
        paymentMethod: checkoutPayment.paymentMethod,
      }).unwrap();

      autoCheckedInvoiceRef.current = null;
      cancelledInvoiceRef.current = null;
      setCheckoutPayment(created);
      setCheckoutPlanName(created.packageName || checkoutPlanName);
      setCheckoutSyncSummary(null);
      setCheckoutSyncError(null);
      setCheckCooldownSeconds(0);
      setClockNow(Date.now());

      notify({
        title: "Đã tạo mã thanh toán mới",
        message: created.invoiceNumber,
        type: "success",
      });
    } catch (createError) {
      notify({
        title: "Không tạo được mã mới",
        message: extractErrorMessage(
          createError,
          "Hệ thống chưa thể tạo hóa đơn mới lúc này.",
        ),
        type: "error",
      });
    }
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      void cancelCurrentPendingPayment("request");
      setCheckCooldownSeconds(0);
      setIsQrDialogOpen(false);
      return;
    }

    setIsQrDialogOpen(true);
  };

  useEffect(() => {
    if (!isQrDialogOpen) {
      return;
    }

    const handleBeforeClose = () => {
      void cancelCurrentPendingPayment("fire-and-forget");
    };

    window.addEventListener("beforeunload", handleBeforeClose);
    window.addEventListener("pagehide", handleBeforeClose);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeClose);
      window.removeEventListener("pagehide", handleBeforeClose);
    };
  }, [cancelCurrentPendingPayment, isQrDialogOpen]);

  useEffect(() => {
    if (
      !isQrDialogOpen ||
      checkoutPayment?.status !== "pending" ||
      !expiresAtMs
    ) {
      return;
    }

    const intervalId = setInterval(() => {
      setClockNow(Date.now());
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [checkoutPayment?.status, expiresAtMs, isQrDialogOpen]);

  useEffect(() => {
    if (!expiredByClock) {
      return;
    }

    setCheckoutPayment((current) => {
      if (!current || current.status !== "pending") {
        return current;
      }

      return {
        ...current,
        status: "failed",
        failureReason: "expired",
        isExpired: true,
      };
    });
  }, [expiredByClock]);

  useEffect(() => {
    if (checkCooldownSeconds <= 0) {
      return;
    }

    const timerId = window.setTimeout(() => {
      setCheckCooldownSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [checkCooldownSeconds]);

  useEffect(() => {
    if (
      !isQrDialogOpen ||
      !canManualCheckPayment ||
      !checkoutPayment?.invoiceNumber
    ) {
      return;
    }

    if (autoCheckedInvoiceRef.current === checkoutPayment.invoiceNumber) {
      return;
    }

    autoCheckedInvoiceRef.current = checkoutPayment.invoiceNumber;

    const timeoutId = window.setTimeout(() => {
      void runReconcile(true);
    }, AUTO_CHECK_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    canManualCheckPayment,
    checkoutPayment?.invoiceNumber,
    isQrDialogOpen,
    runReconcile,
  ]);

  const createInvoiceForPlan = useCallback(
    async (plan: PricingPlan) => {
      if (!plan.packageId) {
        notify({
          title: "Không tạo được hóa đơn",
          message: "Thiếu thông tin gói thanh toán.",
          type: "error",
        });
        return;
      }

      if (plan.price < MIN_PAID_PACKAGE_AMOUNT) {
        notify({
          title: "Giá gói chưa hợp lệ",
          message: `Gói trả phí cần có giá tối thiểu ${MIN_PAID_PACKAGE_AMOUNT.toLocaleString("vi-VN")}đ.`,
          type: "warning",
        });
        return;
      }

      setUpgradeConfirmation(null);
      setCreatingPackageId(plan.packageId);

      try {
        const payment = await createPayment({
          packageId: plan.packageId,
          paymentMethod: "bank_transfer",
        }).unwrap();

        autoCheckedInvoiceRef.current = null;
        cancelledInvoiceRef.current = null;
        setCheckoutPlanName(plan.name);
        setCheckoutPayment(payment);
        setCheckoutSyncSummary(null);
        setCheckoutSyncError(null);
        setCheckCooldownSeconds(0);
        setClockNow(Date.now());
        setIsQrDialogOpen(true);

        notify({
          title: "Đã tạo hóa đơn",
          message: `${plan.name} - ${payment.invoiceNumber}`,
          type: "success",
        });
      } catch (createError) {
        notify({
          title: "Không tạo được hóa đơn",
          message: extractErrorMessage(
            createError,
            "Hệ thống chưa tạo được QR cho gói này. Vui lòng thử lại sau.",
          ),
          type: "error",
        });
      } finally {
        setCreatingPackageId(null);
      }
    },
    [createPayment],
  );

  const handleConfirmUpgrade = useCallback(() => {
    if (!upgradeConfirmation) {
      return;
    }

    const nextPlan = upgradeConfirmation.nextPlan;
    setUpgradeConfirmation(null);
    void createInvoiceForPlan(nextPlan);
  }, [createInvoiceForPlan, upgradeConfirmation]);

  const handleCheckout = async (plan: PricingPlan) => {
    const selectedPlanRank =
      planRankLookup.get(plan.id) ?? Number.MAX_SAFE_INTEGER;
    const isCurrentPlan = currentPricingPlan?.id === plan.id;
    const isBlockedByUpgradePolicy =
      currentPlanRank !== null &&
      selectedPlanRank <= currentPlanRank &&
      !isCurrentPlan;

    if (isCurrentPlan) {
      notify({
        title: "Bạn đang ở gói này",
        message: `Gói ${plan.name} đang được áp dụng cho tài khoản của bạn.`,
        type: "info",
      });
      return;
    }

    if (isBlockedByUpgradePolicy) {
      notify({
        title: "Chỉ có thể nâng cấp gói",
        message:
          "Để tránh mất quyền lợi đã thanh toán, hệ thống chỉ cho phép đổi sang gói cao hơn gói hiện tại.",
        type: "warning",
      });
      return;
    }

    if (plan.isFree) {
      router.push("/learn");
      return;
    }

    const isUpgradeFromPaidPlan =
      !!currentPricingPlan && !currentPricingPlan.isFree;

    if (isUpgradeFromPaidPlan) {
      setUpgradeConfirmation({
        currentPlanName: currentPricingPlan.name,
        nextPlan: plan,
      });
      return;
    }

    await createInvoiceForPlan(plan);
  };

  const qrData = checkoutPayment?.paymentQr;
  const manualCheckButtonLabel = isReconcilingPayment
    ? "Đang kiểm tra..."
    : checkCooldownSeconds > 0
      ? `Đã thanh toán (${checkCooldownSeconds}s)`
      : "Đã thanh toán";

  return (
    <ProtectedRoute>
      <main className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col gap-8 px-5 py-8 md:px-8 md:py-10">
        <section className="px-2 py-6 md:py-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-medium text-slate-500">SmartLingo</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
              Đăng ký gói học
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-600 md:text-xl">
              Chọn gói phù hợp với nhu cầu học tập của bạn.
            </p>
          </div>
        </section>

        {featureQuotaOverview ? (
          <section className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm md:px-6 md:py-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Gói hiện tại
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                  {featureQuotaOverview.packageName}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Nguồn áp dụng:{" "}
                  {featureQuotaOverview.source === "paid_payment"
                    ? "Thanh toán gần nhất"
                    : "Gói mặc định"}
                </p>
              </div>

              <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                {isFeatureQuotaFetching
                  ? "Đang đồng bộ quota realtime..."
                  : `Cập nhật: ${new Date(featureQuotaOverview.generatedAt).toLocaleTimeString("vi-VN")}`}
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {featureQuotaOverview.features.map((feature) => {
                const usagePercent =
                  feature.enabled &&
                  !feature.isUnlimited &&
                  typeof feature.quota === "number" &&
                  feature.quota > 0 &&
                  typeof feature.used === "number"
                    ? Math.min(
                        100,
                        Math.round((feature.used / feature.quota) * 100),
                      )
                    : null;

                return (
                  <article
                    key={feature.featureKey}
                    className={`rounded-2xl border px-4 py-4 ${
                      feature.isBlocked
                        ? "border-rose-200 bg-rose-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {feature.featureLabel}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {feature.enabled
                        ? `${ACCESS_LEVEL_LABELS[feature.accessLevel ?? "basic"]} - ${feature.quotaPeriodLabel ?? "Không kỳ hạn"}`
                        : "Chưa được mở trong gói hiện tại"}
                    </p>

                    <p
                      className={`mt-3 text-sm font-semibold ${
                        feature.isBlocked ? "text-rose-700" : "text-slate-900"
                      }`}
                    >
                      {formatRemainingQuotaLabel(feature)}
                    </p>

                    {feature.enabled &&
                    !feature.isUnlimited &&
                    feature.quota !== null &&
                    feature.used !== null ? (
                      <>
                        <div className="mt-2 h-2 rounded-full bg-slate-200">
                          <div
                            className={`h-full rounded-full ${
                              feature.isBlocked
                                ? "bg-rose-500"
                                : usagePercent !== null && usagePercent >= 85
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                            }`}
                            style={{ width: `${usagePercent ?? 0}%` }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          Đã dùng {feature.used}/{feature.quota} lượt
                        </p>
                      </>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        {isLoading ? (
          <section className="overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-4 px-4 py-5 md:px-6 md:py-6 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[24px] border border-slate-200 p-4"
                >
                  <Skeleton className="h-8 w-28 rounded-xl" />
                  <Skeleton className="mt-4 h-5 w-4/5 rounded-xl" />
                  <Skeleton className="mt-10 h-10 w-40 rounded-xl" />
                  <Skeleton className="mt-4 h-11 w-full rounded-full" />
                  <div className="mt-6 space-y-3">
                    {Array.from({ length: 7 }).map((__, itemIndex) => (
                      <Skeleton
                        key={itemIndex}
                        className="h-5 w-full rounded-xl"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {isError ? (
          <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-5 text-sm text-rose-700">
            {extractErrorMessage(
              error,
              "Không tải được danh sách gói. Vui lòng thử lại sau.",
            )}
          </div>
        ) : null}

        {!isLoading && !isError ? (
          <section className="overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-4 px-4 py-5 md:px-6 md:py-6 xl:grid-cols-4">
              {pricingPlans.map((plan) => {
                const isCurrentLoading =
                  !plan.isFree &&
                  isCreatingPayment &&
                  creatingPackageId === plan.packageId;
                const isHighlighted =
                  !plan.isFree && highlightedPaidPlanId === plan.id;
                const planRank =
                  planRankLookup.get(plan.id) ?? Number.MAX_SAFE_INTEGER;
                const isCurrentPlan = currentPricingPlan?.id === plan.id;
                const isUpgradePlan =
                  currentPlanRank !== null && planRank > currentPlanRank;
                const isBlockedByUpgradePolicy =
                  currentPlanRank !== null &&
                  planRank <= currentPlanRank &&
                  !isCurrentPlan;
                const ctaLabel = isCurrentPlan
                  ? "Đang sử dụng"
                  : isBlockedByUpgradePolicy
                    ? "Chỉ đổi lên gói cao hơn"
                    : isUpgradePlan && !plan.isFree
                      ? `Nâng cấp lên ${plan.name}`
                      : plan.ctaLabel;
                const isCheckoutDisabled =
                  (isCreatingPayment && !plan.isFree) ||
                  isCurrentPlan ||
                  isBlockedByUpgradePolicy;

                return (
                  <article
                    key={plan.id}
                    className={`flex h-full flex-col rounded-[24px] border p-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_20px_45px_-22px_rgba(15,23,42,0.35)] ${
                      isHighlighted
                        ? "border-slate-900 bg-slate-950 text-white hover:shadow-[0_24px_55px_-22px_rgba(2,6,23,0.6)]"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        {isCurrentPlan ? (
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                              isHighlighted
                                ? "border-emerald-300/60 bg-emerald-500/20 text-emerald-100"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            Gói hiện tại
                          </span>
                        ) : null}

                        {isUpgradePlan && !plan.isFree ? (
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                              isHighlighted
                                ? "border-cyan-300/60 bg-cyan-500/20 text-cyan-100"
                                : "border-cyan-200 bg-cyan-50 text-cyan-700"
                            }`}
                          >
                            Có thể nâng cấp
                          </span>
                        ) : null}
                      </div>

                      <h3
                        className={`text-[2rem] font-medium tracking-tight ${
                          isHighlighted ? "text-white" : "text-slate-950"
                        }`}
                      >
                        {plan.name}
                      </h3>
                      <p
                        className={`mt-1 min-h-[56px] text-sm leading-7 ${
                          isHighlighted ? "text-slate-300" : "text-slate-600"
                        }`}
                      >
                        {plan.description}
                      </p>

                      <div className="mt-7 flex items-end gap-2">
                        <span
                          className={`text-4xl font-semibold tracking-tight ${
                            isHighlighted ? "text-white" : "text-slate-950"
                          }`}
                        >
                          {formatCurrency(plan.price, plan.currency)}
                        </span>
                        <span
                          className={`pb-1 text-sm ${
                            isHighlighted ? "text-slate-300" : "text-slate-500"
                          }`}
                        >
                          {plan.billingCycleLabel}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() => void handleCheckout(plan)}
                      disabled={isCheckoutDisabled}
                      className={`mt-5 h-10 rounded-full text-sm font-semibold ${
                        isHighlighted
                          ? "bg-white text-slate-950 hover:bg-slate-100"
                          : "bg-slate-950 text-white hover:bg-slate-800"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {isCurrentLoading ? (
                        <>
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                          Đang tạo QR...
                        </>
                      ) : (
                        <>
                          {ctaLabel}
                          {!isCurrentPlan && !isBlockedByUpgradePolicy ? (
                            <ArrowRight className="ml-2 h-4 w-4" />
                          ) : null}
                        </>
                      )}
                    </Button>

                    {isBlockedByUpgradePolicy ? (
                      <p
                        className={`mt-2 text-xs ${
                          isHighlighted ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        Bạn đang dùng gói cao hơn, nên không thể đổi xuống gói
                        này.
                      </p>
                    ) : null}

                    <div
                      className={`mt-5 flex-1 border-t pt-5 ${
                        isHighlighted ? "border-slate-700" : "border-slate-200"
                      }`}
                    >
                      {!plan.isFree ? (
                        <p
                          className={`text-sm font-semibold ${
                            isHighlighted ? "text-white" : "text-slate-900"
                          }`}
                        >
                          Mọi tính năng trong gói Free và:
                        </p>
                      ) : null}

                      <ul className="mt-3 space-y-3">
                        {plan.featureLines.map((line) => (
                          <li
                            key={`${plan.id}-${line}`}
                            className={`flex items-start gap-3 text-sm leading-7 ${
                              isHighlighted
                                ? "text-slate-200"
                                : "text-slate-700"
                            }`}
                          >
                            <span
                              className={`mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                                isHighlighted
                                  ? "border-slate-700 bg-slate-800"
                                  : "border-slate-200 bg-slate-50"
                              }`}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </span>
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        <Dialog
          open={Boolean(upgradeConfirmation)}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setUpgradeConfirmation(null);
            }
          }}
        >
          <DialogContent className="w-[min(520px,94vw)] border border-slate-200 p-6 shadow-2xl sm:max-w-[520px]">
            <DialogHeader className="space-y-2 text-left sm:text-left">
              <DialogTitle className="text-xl font-semibold text-slate-900">
                Xác nhận nâng cấp gói
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-slate-600">
                {upgradeConfirmation ? (
                  <>
                    Bạn đang dùng gói{" "}
                    <span className="font-semibold text-slate-900">
                      {upgradeConfirmation.currentPlanName}
                    </span>
                    .
                    <br />
                    Khi nâng cấp lên gói{" "}
                    <span className="font-semibold text-slate-900">
                      {upgradeConfirmation.nextPlan.name}
                    </span>
                    , gói hiện tại sẽ bị hủy và bạn sẽ đăng ký gói mới.
                  </>
                ) : null}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-lg"
                onClick={() => setUpgradeConfirmation(null)}
              >
                Hủy
              </Button>
              <Button
                type="button"
                className="h-9 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                onClick={handleConfirmUpgrade}
              >
                Xác nhận
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isQrDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogContent className="w-[min(920px,96vw)] gap-0 overflow-hidden border border-slate-200 p-0 shadow-2xl sm:max-w-[920px]">
            <DialogHeader className="border-b border-slate-200 px-6 py-5 text-left sm:text-left">
              <DialogTitle className="text-xl font-semibold text-slate-900">
                Thanh toán gói{" "}
                {checkoutPlanName || checkoutPayment?.packageName || "học"}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                Hóa đơn: {checkoutPayment?.invoiceNumber || "N/A"}
              </DialogDescription>
            </DialogHeader>

            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                <div className="inline-flex items-center gap-2 text-emerald-700">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
                    1
                  </span>
                  Xác nhận
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
                <div className="inline-flex items-center gap-2 text-slate-900">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white">
                    2
                  </span>
                  Chuyển khoản
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
                <div className="inline-flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-500">
                    3
                  </span>
                  Hoàn tất
                </div>
              </div>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-[1fr_1.15fr]">
              <div className="space-y-4">
                <div className="mx-auto w-full max-w-[260px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  {qrData ? (
                    <img
                      src={qrData.qrImageUrl}
                      alt="QR thanh toán"
                      className="h-auto w-full rounded-xl"
                    />
                  ) : (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-5 text-center text-sm text-amber-700">
                      {checkoutPayment?.paymentQrSetupError ||
                        "Hệ thống chưa đủ cấu hình QR cho thanh toán chuyển khoản."}
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={() => void handleManualCheckPayment()}
                  disabled={
                    !canManualCheckPayment ||
                    isReconcilingPayment ||
                    checkCooldownSeconds > 0
                  }
                  className="h-11 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {isReconcilingPayment ? (
                    <>
                      <Clock3 className="mr-2 h-4 w-4 animate-spin" />
                      {manualCheckButtonLabel}
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      {manualCheckButtonLabel}
                    </>
                  )}
                </Button>

                {checkoutPayment?.status === "paid" ? (
                  <Button
                    type="button"
                    onClick={() => {
                      setIsQrDialogOpen(false);
                      router.push("/learn");
                    }}
                    className="h-11 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-500"
                  >
                    <CircleCheckBig className="mr-2 h-4 w-4" />
                    Tiếp tục học
                  </Button>
                ) : null}

                {(isExpiredPayment || isCancelledPayment) &&
                checkoutPayment?.packageId ? (
                  <Button
                    type="button"
                    onClick={() => void handleCreateNewInvoice()}
                    disabled={isCreatingPayment}
                    className="h-11 w-full rounded-xl bg-amber-500 text-white hover:bg-amber-400"
                  >
                    {isCreatingPayment ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Đang tạo mã mới...
                      </>
                    ) : (
                      "Tạo mã thanh toán mới"
                    )}
                  </Button>
                ) : null}
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Ngân hàng
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {getBankDisplayName(qrData?.bankCode)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Số tài khoản
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(qrData?.accountNumber, "số tài khoản")
                      }
                      className="mt-1 inline-flex items-center gap-2 text-lg font-semibold text-slate-900"
                    >
                      {qrData?.accountNumber || "N/A"}
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                      Nội dung chuyển khoản
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          qrData?.transferContent,
                          "nội dung chuyển khoản",
                        )
                      }
                      className="mt-1 inline-flex items-center gap-2 text-lg font-semibold text-emerald-800"
                    >
                      {qrData?.transferContent || "N/A"}
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Số tiền
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">
                      {formatCurrency(
                        Number(checkoutPayment?.amount ?? 0),
                        checkoutPayment?.currency || "VND",
                      )}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Hướng dẫn thanh toán
                  </p>
                  <ol className="mt-2 space-y-2 text-sm text-slate-600">
                    <li>1. Mở ứng dụng ngân hàng của bạn.</li>
                    <li>2. Quét QR trên màn hình.</li>
                    <li>
                      3. Vui lòng chờ đợi, hệ thống sẽ xác nhận sau ít giây.
                    </li>
                    <li>
                      4. Nếu chưa cập nhật, hãy bấm nút Đã thanh toán để hệ
                      thống kiểm tra giao dịch.
                    </li>
                  </ol>
                </div>

                {checkoutSyncSummary ? (
                  <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-xs text-cyan-900">
                    <p className="font-semibold">Kết quả kiểm tra gần nhất</p>
                    <p className="mt-1">{checkoutSyncSummary.message}</p>
                  </div>
                ) : null}

                {checkoutSyncError ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
                    {checkoutSyncError}
                  </div>
                ) : null}

                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                  {resolveCheckoutStatusText()}
                  {checkoutPayment?.status === "pending" ? (
                    <span className="ml-2 inline-flex items-center gap-1 font-semibold">
                      <Clock3 className="h-4 w-4" />
                      {formatCountdown(remainingSeconds ?? 0)}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </ProtectedRoute>
  );
}
