'use client'

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { removeNotification } from '@/lib/slices/notificationSlice'
import type { Notification } from '@/types'
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react'

interface NotificationItemProps {
  notification: Notification
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const dispatch = useDispatch()

  useEffect(() => {
    if (notification.duration === 0) return

    const timer = setTimeout(() => {
      dispatch(removeNotification(notification.id))
    }, notification.duration || 5000)

    return () => clearTimeout(timer)
  }, [notification.id, notification.duration, dispatch])

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
      default:
        return null
    }
  }

  const getStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800'
      case 'error':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800'
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800'
      default:
        return 'border-slate-200 bg-slate-50 dark:bg-slate-900/20 dark:border-slate-800'
    }
  }

  const getTitleStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-900 dark:text-green-100'
      case 'error':
        return 'text-red-900 dark:text-red-100'
      case 'warning':
        return 'text-yellow-900 dark:text-yellow-100'
      case 'info':
        return 'text-blue-900 dark:text-blue-100'
      default:
        return 'text-slate-900 dark:text-slate-100'
    }
  }

  const getMessageStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-800 dark:text-green-200'
      case 'error':
        return 'text-red-800 dark:text-red-200'
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-200'
      case 'info':
        return 'text-blue-800 dark:text-blue-200'
      default:
        return 'text-slate-800 dark:text-slate-200'
    }
  }

  return (
    <div
      className={`flex gap-3 px-4 py-3 rounded-lg border animate-in slide-in-from-right-full fade-in ${getStyles()}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0 pt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${getTitleStyles()}`}>{notification.title}</p>
        {notification.message && (
          <p className={`text-sm mt-1 ${getMessageStyles()}`}>{notification.message}</p>
        )}
      </div>
      <button
        onClick={() => dispatch(removeNotification(notification.id))}
        className="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Đóng thông báo"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}
