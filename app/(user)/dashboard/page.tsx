import type { Metadata } from 'next'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { ProtectedRoute } from '@/components/auth/protected-route'

export const metadata: Metadata = {
  title: 'Dashboard | My App',
  description: 'Bảng điều khiển ứng dụng',
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
