'use client'

import { useSelector } from 'react-redux'
import type { RootState } from '@/lib/store'
import { NotificationContainer } from '@/components/notification/notification-container'

export function NotificationProvider() {
  const notifications = useSelector((state: RootState) => state.notification.notifications)

  return <NotificationContainer notifications={notifications} />
}
