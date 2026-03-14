'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLogoutMutation } from '@/lib/api/authApi'
import { useDispatch } from 'react-redux'
import { logout } from '@/lib/slices/authSlice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useNotification } from '@/hooks/use-notification'

export function DashboardContent() {
  const router = useRouter()
  const { user } = useAuth()
  const [logoutApi] = useLogoutMutation()
  const dispatch = useDispatch()
  const { success: notifySuccess } = useNotification()

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap()
      dispatch(logout())
      notifySuccess('Đã đăng xuất', 'Tạm biệt!')
      router.push('/login')
    } catch (error) {
      dispatch(logout())
      router.push('/login')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My App</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Chào, <span className="font-semibold text-foreground">{user?.name}</span>
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Đăng xuất
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin tài khoản</CardTitle>
              <CardDescription>Chi tiết hồ sơ của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Tên</p>
                  <p className="font-medium">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ID</p>
                  <p className="font-medium text-xs truncate">{user?.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Setup RTK Query</CardTitle>
              <CardDescription>Hướng dẫn</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                RTK Query đã được cấu hình sẵn. Bạn có thể tạo các API endpoints trong <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">/lib/api</code>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Hệ thống thông báo</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Sử dụng hook <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">useNotification()</code> để hiển thị thông báo
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
