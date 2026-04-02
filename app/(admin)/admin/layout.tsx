import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminRoute } from "@/components/auth/admin-route";
import { AdminShell } from "@/components/layouts/admin-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AdminRoute>
        <AdminShell>{children}</AdminShell>
      </AdminRoute>
    </ProtectedRoute>
  );
}
