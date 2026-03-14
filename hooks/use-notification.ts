import { useDispatch } from 'react-redux'
import { addNotification, removeNotification } from '@/lib/slices/notificationSlice'
import type { NotificationType } from '@/types'

export function useNotification() {
  const dispatch = useDispatch()

  const notify = (
    title: string,
    message?: string,
    type: NotificationType = 'default',
    duration?: number
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    dispatch(addNotification({ title, message, type, duration }))

    if (duration !== 0) {
      const timeoutDuration = duration || 5000
      setTimeout(() => {
        dispatch(removeNotification(id))
      }, timeoutDuration)
    }

    return id
  }

  const success = (title: string, message?: string, duration?: number) =>
    notify(title, message, 'success', duration)

  const error = (title: string, message?: string, duration?: number) =>
    notify(title, message, 'error', duration)

  const warning = (title: string, message?: string, duration?: number) =>
    notify(title, message, 'warning', duration)

  const info = (title: string, message?: string, duration?: number) =>
    notify(title, message, 'info', duration)

  return { notify, success, error, warning, info }
}
