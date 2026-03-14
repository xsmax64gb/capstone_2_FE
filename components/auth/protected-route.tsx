'use client'

import { useEffect, ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Spinner } from '@/components/ui/spinner'
import { useI18n } from '@/lib/i18n/context'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { t } = useI18n()
  const isOnboardingPath = pathname?.startsWith('/onboarding')
  const onboardingPending = user?.onboardingDone === false

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (!isAuthenticated) {
      router.replace('/login')
      return
    }

    if (onboardingPending && !isOnboardingPath) {
      router.replace('/onboarding')
      return
    }

    if (!onboardingPending && isOnboardingPath) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, isLoading, isOnboardingPath, onboardingPending, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner />
          <p className="text-muted-foreground">{t('Đang tải...')}</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (onboardingPending && !isOnboardingPath) {
    return null
  }

  if (!onboardingPending && isOnboardingPath) {
    return null
  }

  return <>{children}</>
}
