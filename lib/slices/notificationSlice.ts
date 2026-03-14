import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Notification, NotificationType } from '@/types'

interface NotificationState {
  notifications: Notification[]
}

const initialState: NotificationState = {
  notifications: [],
}

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, 'id'>>
    ) => {
      const id = Math.random().toString(36).substr(2, 9)
      const notification: Notification = {
        ...action.payload,
        id,
        duration: action.payload.duration || 5000,
      }
      state.notifications.push(notification)
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notif) => notif.id !== action.payload
      )
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
  },
})

export const { addNotification, removeNotification, clearNotifications } =
  notificationSlice.actions
export default notificationSlice.reducer
