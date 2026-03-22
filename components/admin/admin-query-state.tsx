"use client";

import { AlertCircle } from "lucide-react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";

export function AdminPageLoading() {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-[30px] border border-slate-200 bg-white">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <Spinner className="h-4 w-4" />
        Đang tải dữ liệu admin...
      </div>
    </div>
  );
}

export function AdminPageError({ message }: { message?: string }) {
  return (
    <Empty className="rounded-[30px] border border-rose-200 bg-rose-50/70">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-rose-100 text-rose-600">
          <AlertCircle className="h-5 w-5" />
        </EmptyMedia>
        <EmptyTitle>Không tải được dữ liệu admin</EmptyTitle>
        <EmptyDescription>
          {message || "Kiểm tra lại quyền admin, token đăng nhập hoặc kết nối backend."}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
