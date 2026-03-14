'use client'

import type { Notification } from '@/types'
import { NotificationItem } from './notification-item'

interface NotificationContainerProps {
  notifications: Notification[]
}

export function NotificationContainer({ notifications }: NotificationContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationItem notification={notification} />
        </div>
      ))}
    </div>
  )
}
