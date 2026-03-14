import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">My App</h1>
          <p className="text-lg text-muted-foreground">
            Ứng dụng Frontend với RTK Query, Authentication & Notifications
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/login" className="block">
            <Button className="w-full" size="lg">
              Đăng nhập
            </Button>
          </Link>

          <Link href="/register" className="block">
            <Button variant="outline" className="w-full" size="lg">
              Đăng ký
            </Button>
          </Link>

          <Link href="/dashboard" className="block mt-4">
            <Button variant="ghost" className="w-full">
              Tới Dashboard
            </Button>
          </Link>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <p className="text-sm font-semibold text-foreground">Tính năng:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✓ JWT Authentication</li>
            <li>✓ RTK Query API Management</li>
            <li>✓ Global Toast Notifications</li>
            <li>✓ Protected Routes</li>
            <li>✓ shadcn/ui Components</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
