import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminShell } from "@/components/layouts/admin-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AdminShell>{children}</AdminShell>
    </ProtectedRoute>
  );
}
