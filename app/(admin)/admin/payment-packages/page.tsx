"use client";

import { PaymentPackagesManager } from "@/components/admin/payment-packages-manager";
import { Badge } from "@/components/ui/badge";

export default function AdminPaymentPackagesPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
        <div className="max-w-3xl">
          <Badge
            variant="outline"
            className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500"
          >
            Payment Packages
          </Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
            Quản lý gói thanh toán và phạm vi sử dụng.
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            Thiết lập rõ ràng chức năng nào được mở theo gói, mức độ truy cập và
            quota theo từng module để frontend hiển thị đúng chính sách gói.
          </p>
        </div>
      </section>

      <PaymentPackagesManager />
    </div>
  );
}
